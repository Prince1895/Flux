const db = require('../config/db');
const { assumeCustomerRole } = require('../services/awsService');
const {
    deleteEbsVolume,
    releaseElasticIp,
    terminateInstance,
    deleteSnapshot,
    deleteLoadBalancer,
    deleteNatGateway,
    deleteSecurityGroup,
} = require('../services/reaperService');

exports.executeReap = async (req, res) => {
    try {
        const { zombieId } = req.params;
        const tenant_id = req.user.tenant_id;
        const userId = req.user.id;

        console.log(`[Reaper] Initiating reap sequence for zombie: ${zombieId}`);

        // 1. Fetch the zombie resource + its cloud account (verify ownership)
        const zombieResult = await db.query(
            `SELECT zr.*, ca.id AS ca_id, ca.credentials_json, ca.region AS ca_region
             FROM zombie_resources zr
             JOIN cloud_accounts ca ON zr.account_id = ca.id
             WHERE zr.id = $1 AND zr.tenant_id = $2`,
            [zombieId, tenant_id]
        );
        const zombie = zombieResult.rows[0];

        if (!zombie) {
            return res.status(404).json({ error: 'Zombie resource not found or access denied.' });
        }

        if (zombie.status === 'reaped') {
            return res.status(400).json({ error: 'This resource has already been reaped.' });
        }

        // 2. Extract AWS credentials from the joined cloud account
        const roleArn = zombie.credentials_json?.role_arn;
        if (!roleArn) {
            return res.status(400).json({ error: 'No IAM Role ARN found for this cloud account.' });
        }

        // 3. Assume Role
        console.log(`[Reaper] Assuming role ${roleArn}...`);
        const credentials = await assumeCustomerRole(roleArn);

        // 4. Execute the deletion based on resource type
        const region = zombie.region || zombie.ca_region || 'us-east-1';
        let actionMessage = '';

        console.log(`[Reaper] Terminating ${zombie.resource_type} -> ${zombie.external_id}`);

        switch (zombie.resource_type) {
            case 'ebs_volume':
                await deleteEbsVolume(credentials, region, zombie.external_id);
                actionMessage = `Deleted EBS Volume: ${zombie.external_id}`;
                break;

            case 'elastic_ip':
                await releaseElasticIp(credentials, region, zombie.external_id);
                actionMessage = `Released Elastic IP: ${zombie.external_id}`;
                break;

            case 'ec2_instance':
                await terminateInstance(credentials, region, zombie.external_id);
                actionMessage = `Terminated EC2 Instance: ${zombie.external_id}`;
                break;

            case 'ebs_snapshot':
                await deleteSnapshot(credentials, region, zombie.external_id);
                actionMessage = `Deleted EBS Snapshot: ${zombie.external_id}`;
                break;

            case 'load_balancer':
                await deleteLoadBalancer(credentials, region, zombie.external_id);
                actionMessage = `Deleted Load Balancer: ${zombie.external_id}`;
                break;

            case 'nat_gateway':
                await deleteNatGateway(credentials, region, zombie.external_id);
                actionMessage = `Deleted NAT Gateway: ${zombie.external_id}`;
                break;

            case 'security_group':
                await deleteSecurityGroup(credentials, region, zombie.external_id);
                actionMessage = `Deleted Security Group: ${zombie.external_id}`;
                break;

            default:
                return res.status(400).json({ error: `Unsupported resource type: ${zombie.resource_type}` });
        }

        // 5. Update zombie status
        const { rowCount } = await db.query(
            `UPDATE zombie_resources SET status = 'reaped', reaped_at = NOW() WHERE id = $1`,
            [zombieId]
        );
        if (rowCount === 0) {
            console.error('Critical: Resource deleted in AWS but failed to update status in DB!');
        }

        // 6. Write audit log
        await db.query(
            `INSERT INTO reaping_logs (tenant_id, resource_id, user_id, action_taken, savings_achieved)
             VALUES ($1, $2, $3, $4, $5)`,
            [tenant_id, zombieId, userId, actionMessage, zombie.estimated_monthly_cost || 0]
        );

        console.log(`[Reaper] Successfully reaped ${zombieId}!`);

        res.status(200).json({
            message: 'Resource permanently deleted from AWS!',
            action: actionMessage,
            savings_recovered_usd: zombie.estimated_monthly_cost,
        });

    } catch (error) {
        console.error('[Reaper] Execution Error:', error);
        res.status(500).json({ error: error.message || 'An error occurred during deletion.' });
    }
};
