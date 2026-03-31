const db = require('./src/config/db');

async function runMigration() {
    try {
        console.log('Running migrations...');
        await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';`);
        await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS scan_credits INTEGER DEFAULT 5;`);
        await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ DEFAULT NOW();`);
        console.log('Migrations completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        process.exit(0);
    }
}

runMigration();
