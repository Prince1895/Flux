require('dotenv').config();
const app = require('./app');

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
    console.log('✅ Billing columns successfully added to tenants table.');
  } catch (e) {
    console.error('❌ Boot-time migration failed:', e);
  }
});
