const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Pushes schema.sql to Neon using the HTTP SQL API (port 443).
 * This bypasses ISP blocks on port 5432.
 */
async function pushSchema() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ DATABASE_URL is not set in .env');
        process.exit(1);
    }

    // Parse the connection string to extract host and credentials
    // Format: postgresql://user:password@host/database?...
    // Remove -pooler from both the hostname and the connection string sent in the header
    const cleanConnectionString = connectionString.replace('-pooler', '');
    const url = new URL(cleanConnectionString);
    const host = url.hostname;           // e.g. ep-bold-haze-abc123.us-east-1.aws.neon.tech
    const username = decodeURIComponent(url.username);
    const password = decodeURIComponent(url.password);
    const database = url.pathname.replace('/', '');

    // Neon HTTP API endpoint
    const apiUrl = `https://${host}/sql`;

    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // Split into individual statements (Neon HTTP API runs one statement at a time)
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`🔌 Connecting to Neon via HTTPS (port 443)...`);
    console.log(`📍 Host: ${host}`);
    console.log(`📦 Running ${statements.length} SQL statements...\n`);

    let success = 0;
    for (const stmt of statements) {
        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
                    'Neon-Connection-String': cleanConnectionString,
                },
                body: JSON.stringify({ query: stmt })
            });

            if (!res.ok) {
                const err = await res.text();
                console.error(`❌ Failed: ${stmt.substring(0, 60)}...\n   Error: ${err}`);
            } else {
                console.log(`✅ OK: ${stmt.substring(0, 70).replace(/\n/g, ' ')}...`);
                success++;
            }
        } catch (err) {
            console.error(`❌ Network error on statement: ${err.message}`);
        }
    }

    console.log(`\n🎉 Done! ${success}/${statements.length} statements applied.`);
}

pushSchema();
