require('dotenv').config();
const db = require('./src/config/db');

async function run() {
    try {
        console.log('Running schema migrations via pg-pool...');

        await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';`);
        console.log('✅ Added plan column');

        await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS scan_credits INTEGER DEFAULT 5;`);
        console.log('✅ Added scan_credits column');

        await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ DEFAULT NOW();`);
        console.log('✅ Added current_period_start column');

        console.log('✨ All migrations applied successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

run();
