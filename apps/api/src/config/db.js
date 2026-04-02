const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL environment variable');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Neon
});

// Add error handler to prevent crashing on idle clients
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle database client:', err.message);
});

module.exports = pool;
