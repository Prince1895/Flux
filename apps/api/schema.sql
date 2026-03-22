-- GreenOps Reaper - Neon DB Schema
-- Run this in the Neon SQL Editor to create all tables

-- ─────────────────────────────────────────────
-- 1. Tenants (organisations / companies)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. Users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'admin',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. Cloud Accounts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cloud_accounts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID REFERENCES tenants(id) ON DELETE CASCADE,
    account_alias    TEXT NOT NULL DEFAULT 'AWS Account',
    provider         TEXT NOT NULL DEFAULT 'aws',
    region           TEXT DEFAULT 'us-east-1',
    credentials_json JSONB,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. Zombie Resources (scan findings)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zombie_resources (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             UUID REFERENCES tenants(id) ON DELETE CASCADE,
    account_id            UUID REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    external_id           TEXT NOT NULL,
    resource_type         TEXT NOT NULL,
    region                TEXT,
    status                TEXT NOT NULL DEFAULT 'active',
    estimated_monthly_cost NUMERIC(10, 2) DEFAULT 0,
    details               JSONB,
    detected_at           TIMESTAMPTZ DEFAULT NOW(),
    reaped_at             TIMESTAMPTZ
);

-- ─────────────────────────────────────────────
-- 5. Reaping Logs (audit trail)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reaping_logs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID REFERENCES tenants(id) ON DELETE CASCADE,
    resource_id      UUID REFERENCES zombie_resources(id) ON DELETE SET NULL,
    user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
    action_taken     TEXT,
    savings_achieved NUMERIC(10, 2) DEFAULT 0,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);
