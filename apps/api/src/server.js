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

    // OAuth migrations for users table
    await db.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);`);
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_oauth_id') THEN
          ALTER TABLE users ADD CONSTRAINT unique_oauth_id UNIQUE (oauth_provider, oauth_id);
        END IF;
      END $$;
    `);

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

    // Email Queue table
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_queue (
        id SERIAL PRIMARY KEY,
        to_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        html_content TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        attempts INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        sent_at TIMESTAMPTZ
      );
    `);

    console.log('✅ Migrations applied successfully.');
  } catch (e) {
    console.error('❌ Boot-time migration failed:', e);
  }

  // Start cron scheduler for automated scans
  await startScheduler();
});

