require('dotenv').config();
const app = require('./app');
const { startScheduler } = require('./services/scheduler');

const PORT = process.env.PORT || 4000;

const db = require('./config/db');

app.listen(PORT, async () => {
  console.log(`🟢 flux API running on port ${PORT}`);

  // Auto-migrate database (Bypassing CLI network blocks)
  try {
    console.log('🔄 Applying schema migrations on boot...');
    await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';`);
    await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS scan_credits INTEGER DEFAULT 5;`);
    await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ DEFAULT NOW();`);

    // Automation schedules table
    await db.query(`
      CREATE TABLE IF NOT EXISTS automation_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        account_id UUID REFERENCES cloud_accounts(id) ON DELETE CASCADE,
        frequency TEXT NOT NULL DEFAULT 'daily',
        enabled BOOLEAN NOT NULL DEFAULT false,
        notify_email TEXT,
        last_run_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (tenant_id, account_id)
      );
    `);

    console.log('✅ Migrations applied successfully.');
  } catch (e) {
    console.error('❌ Boot-time migration failed:', e);
  }

  // Start cron scheduler for automated scans
  await startScheduler();
});

