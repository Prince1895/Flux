const cron = require('node-cron');
const db = require('../config/db');
const { assumeCustomerRole } = require('./awsService');
const {
    findUnattachedVolumes, findIdleIPs, findStoppedInstances,
    findOldSnapshots, findIdleLoadBalancers, findIdleNatGateways, findUnusedSecurityGroups,
} = require('./scannerService');
const { sendScanReport } = require('./emailService');

// Map of scheduleId -> cron.ScheduledTask
const activeTasks = new Map();

// Frequency → cron expression (runs at 2:00 AM)
const CRON_EXPRESSIONS = {
    daily: '0 2 * * *',
    weekly: '0 2 * * 1',   // Monday 2am
    monthly: '0 2 1 * *',   // 1st of month 2am
};

/**
 * Core job: runs a full scan for an account and emails the report.
 */
const runScheduledScan = async (schedule) => {
    console.log(`[Scheduler] Running scheduled scan for schedule ${schedule.id} (account: ${schedule.account_id})`);

    try {
        // Fetch account details
        const accResult = await db.query('SELECT * FROM cloud_accounts WHERE id = $1', [schedule.account_id]);
        const account = accResult.rows[0];
        if (!account) {
            console.error(`[Scheduler] Account ${schedule.account_id} not found.`);
            return;
        }

        // Check scan credits
        const tenantResult = await db.query('SELECT * FROM tenants WHERE id = $1', [schedule.tenant_id]);
        const tenant = tenantResult.rows[0];
        if (!tenant || tenant.scan_credits <= 0) {
            console.warn(`[Scheduler] Tenant ${schedule.tenant_id} has no scan credits. Skipping.`);
            return;
        }

        // Assume role
        const roleArn = account.credentials_json?.role_arn;
        if (!roleArn) return;
        const credentials = await assumeCustomerRole(roleArn);
        const region = account.region || 'us-east-1';

        // Run all scanners
        const [v, ip, ec2, snap, lb, nat, sg] = await Promise.allSettled([
            findUnattachedVolumes(credentials, region),
            findIdleIPs(credentials, region),
            findStoppedInstances(credentials, region),
            findOldSnapshots(credentials, region),
            findIdleLoadBalancers(credentials, region),
            findIdleNatGateways(credentials, region),
            findUnusedSecurityGroups(credentials, region),
        ]);

        const safe = (r) => r.status === 'fulfilled' ? r.value : [];

        const allZombies = [
            ...safe(v), ...safe(ip), ...safe(ec2), ...safe(snap),
            ...safe(lb), ...safe(nat), ...safe(sg),
        ].map(z => ({ ...z, tenant_id: schedule.tenant_id, account_id: account.id }));

        const totalSavings = allZombies.reduce((s, z) => s + Number(z.estimated_monthly_cost || 0), 0);

        // Save to DB
        for (const zombie of allZombies) {
            await db.query(
                `INSERT INTO zombie_resources
                    (tenant_id, account_id, external_id, resource_type, region, status, estimated_monthly_cost, details)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [
                    zombie.tenant_id, zombie.account_id, zombie.external_id,
                    zombie.resource_type, zombie.region || region,
                    zombie.status || 'active',
                    zombie.estimated_monthly_cost || 0,
                    JSON.stringify(zombie.details || {}),
                ]
            );
        }

        // Deduct credit
        await db.query('UPDATE tenants SET scan_credits = scan_credits - 1 WHERE id = $1', [schedule.tenant_id]);

        // Update last_run_at
        await db.query('UPDATE automation_schedules SET last_run_at = NOW() WHERE id = $1', [schedule.id]);

        console.log(`[Scheduler] Scan complete: ${allZombies.length} zombies, $${totalSavings.toFixed(2)}/mo savings.`);

        // Send email report
        if (schedule.notify_email) {
            const breakdown = {
                ebs_volumes: safe(v).length,
                elastic_ips: safe(ip).length,
                ec2_instances: safe(ec2).length,
                ebs_snapshots: safe(snap).length,
                load_balancers: safe(lb).length,
                nat_gateways: safe(nat).length,
                security_groups: safe(sg).length,
            };

            await sendScanReport(schedule.notify_email, {
                accountName: account.name || account.id,
                region,
                zombies_found: allZombies.length,
                estimated_monthly_savings_usd: totalSavings,
                breakdown,
                scannedAt: new Date().toISOString(),
            }, allZombies);
        }

    } catch (err) {
        console.error(`[Scheduler] Scheduled scan failed for ${schedule.id}:`, err.message);
    }
};

/**
 * Register or update a cron task for a single schedule object.
 * Called on startup (for all enabled schedules) and on save/toggle.
 */
const reloadSchedule = async (schedule) => {
    // Stop any existing task for this schedule
    if (activeTasks.has(schedule.id)) {
        activeTasks.get(schedule.id).stop();
        activeTasks.delete(schedule.id);
        console.log(`[Scheduler] Stopped task for schedule ${schedule.id}`);
    }

    if (!schedule.enabled) return;

    const expression = CRON_EXPRESSIONS[schedule.frequency] || CRON_EXPRESSIONS.daily;
    const task = cron.schedule(expression, () => runScheduledScan(schedule), {
        scheduled: true,
        timezone: 'UTC',
    });
    activeTasks.set(schedule.id, task);
    console.log(`[Scheduler] ✅ Registered ${schedule.frequency} job for schedule ${schedule.id} (cron: ${expression})`);
};

/**
 * Load and register all enabled schedules from the DB.
 * Called once on server startup.
 */
const startScheduler = async () => {
    try {
        const result = await db.query(
            `SELECT s.*, ca.name AS account_name
             FROM automation_schedules s
             JOIN cloud_accounts ca ON s.account_id = ca.id
             WHERE s.enabled = true`
        );
        console.log(`[Scheduler] Loading ${result.rows.length} enabled schedule(s)...`);
        for (const schedule of result.rows) {
            await reloadSchedule(schedule);
        }
    } catch (err) {
        console.error('[Scheduler] Failed to start scheduler:', err.message);
    }
};

module.exports = { startScheduler, reloadSchedule };
