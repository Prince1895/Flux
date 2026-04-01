import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import {
    Activity, LayoutDashboard, Cloud, Zap, BarChart2, Settings,
    Users, LogOut, DollarSign, Bell, Sun, Save, Lock,
    ToggleLeft, ToggleRight, Mail, Clock, RefreshCw, CheckCircle2
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/automation.css';

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Daily', desc: 'Every day at 2:00 AM UTC' },
    { value: 'weekly', label: 'Weekly', desc: 'Every Monday at 2:00 AM UTC' },
    { value: 'monthly', label: 'Monthly', desc: '1st of each month, 2:00 AM UTC' },
];

const Automation = () => {
    const { user, logout } = useAuth();
    const [plan, setPlan] = useState('starter');
    const [scanCredits, setScanCredits] = useState(0);
    const [accounts, setAccounts] = useState([]);
    const [schedules, setSchedules] = useState({}); // keyed by account_id
    const [saving, setSaving] = useState({});  // keyed by account_id
    const [saved, setSaved] = useState({});  // keyed by account_id
    const [loading, setLoading] = useState(true);
    const [tenantName, setTenantName] = useState('');

    useEffect(() => {
        if (user?.company_name) setTenantName(user.company_name);
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [billing, accs, scheds] = await Promise.all([
                api.getBillingStatus(),
                api.getAccounts(),
                api.getAutomationSchedules().catch(() => []),
            ]);

            setPlan(billing.plan || 'starter');
            setScanCredits(billing.scan_credits || 0);
            setAccounts(accs);

            // Build a map keyed by account_id for easy lookup
            const schedMap = {};
            for (const s of (scheds || [])) {
                schedMap[s.account_id] = s;
            }
            // Pre-populate defaults for accounts that don't have a schedule yet
            for (const acc of accs) {
                if (!schedMap[acc.id]) {
                    schedMap[acc.id] = {
                        account_id: acc.id,
                        frequency: 'weekly',
                        enabled: false,
                        notify_email: user?.email || '',
                        last_run_at: null,
                        id: null,
                    };
                }
            }
            setSchedules(schedMap);
        } catch (err) {
            console.error('Automation load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (accountId, field, value) => {
        setSchedules(prev => ({
            ...prev,
            [accountId]: { ...prev[accountId], [field]: value },
        }));
    };

    const handleSave = async (accountId) => {
        setSaving(prev => ({ ...prev, [accountId]: true }));
        try {
            const s = schedules[accountId];
            const result = await api.upsertAutomationSchedule({
                account_id: accountId,
                frequency: s.frequency,
                enabled: s.enabled,
                notify_email: s.notify_email,
            });
            setSchedules(prev => ({ ...prev, [accountId]: result.schedule }));
            setSaved(prev => ({ ...prev, [accountId]: true }));
            setTimeout(() => setSaved(prev => ({ ...prev, [accountId]: false })), 3000);
        } catch (err) {
            alert(`Failed to save: ${err.response?.data?.error || err.message}`);
        } finally {
            setSaving(prev => ({ ...prev, [accountId]: false }));
        }
    };

    const handleToggle = async (accountId) => {
        const s = schedules[accountId];
        if (!s.id) {
            // No saved schedule yet — save first with current settings
            handleSave(accountId);
            return;
        }
        try {
            const result = await api.toggleAutomationSchedule(s.id);
            setSchedules(prev => ({ ...prev, [accountId]: result.schedule }));
        } catch (err) {
            alert(`Failed to toggle: ${err.response?.data?.error || err.message}`);
        }
    };

    const isPaidPlan = ['solo', 'team'].includes(plan);

    return (
        <div className="dash-layout">
            {/* Sidebar */}
            <aside className="dash-sidebar">
                <div className="dash-brand">
                    <Activity color="var(--brand-green, #10b981)" size={24} />
                    <span>Flux</span>
                </div>
                <nav className="dash-nav-group">
                    <Link to="/dashboard" className="dash-nav-item">
                        <LayoutDashboard size={18} /> Overview
                    </Link>
                    <Link to="/dashboard/accounts" className="dash-nav-item">
                        <Cloud size={18} /> Cloud Accounts
                    </Link>
                    <Link to="/dashboard/automation" className="dash-nav-item active">
                        <Zap size={18} /> Automation
                    </Link>
                    <Link to="/dashboard/reports" className="dash-nav-item">
                        <BarChart2 size={18} /> Reports
                    </Link>
                </nav>
                <div className="dash-nav-label">SYSTEM</div>
                <nav className="dash-nav-group">
                    <a href="#" className="dash-nav-item"><Settings size={18} /> Settings</a>
                    <a href="#" className="dash-nav-item"><Users size={18} /> Team</a>
                    <Link to="/dashboard/pricing" className="dash-nav-item">
                        <DollarSign size={18} /> Upgrade Plan
                    </Link>
                </nav>
                <div className="dash-sidebar-footer">
                    <div className="dash-user-profile">
                        <div className="dash-user-avatar">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="dash-user-info">
                            <div className="dash-user-email" title={user?.email}>{user?.email}</div>
                            <div className="dash-user-role">Admin</div>
                        </div>
                        <button onClick={logout} className="dash-logout-btn" title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="dash-main">
                <header className="dash-header">
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Automation</h1>
                        {tenantName && (
                            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6b7280' }}>
                                {tenantName}'s automated scan settings
                            </p>
                        )}
                    </div>
                    <div className="dash-header-actions" style={{ alignItems: 'center' }}>
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', gap: '0.6rem', alignItems: 'center', color: '#374151', fontWeight: 600 }}>
                            <div style={{ background: isPaidPlan ? '#dcfce7' : '#e5e7eb', color: isPaidPlan ? '#15803d' : '#4b5563', border: `1px solid ${isPaidPlan ? '#bbf7d0' : '#d1d5db'}`, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{plan}</div>
                            <span>{scanCredits} Credits Left</span>
                        </div>
                        <button className="dash-icon-btn"><Sun size={20} /></button>
                        <button className="dash-icon-btn" style={{ position: 'relative' }}>
                            <Bell size={20} />
                            <span className="dash-notification-dot"></span>
                        </button>
                    </div>
                </header>

                <div className="dash-content-scroll">

                    {/* Plan Gate */}
                    {!isPaidPlan && (
                        <div className="auto-gate">
                            <div className="auto-gate-icon"><Lock size={32} color="#6b7280" /></div>
                            <h2 className="auto-gate-title">Automation is a paid feature</h2>
                            <p className="auto-gate-body">
                                Automated scheduled scans and email reports are available on the <strong>Solo</strong> and <strong>Team</strong> plans.
                                Upgrade now to never miss a zombie resource again.
                            </p>
                            <div className="auto-gate-plans">
                                <div className="auto-gate-plan">
                                    <div className="auto-gate-plan-name">Solo</div>
                                    <div className="auto-gate-plan-price">$29<span>/mo</span></div>
                                    <div className="auto-gate-plan-detail">50 scan credits/mo · Daily/Weekly/Monthly scans</div>
                                </div>
                                <div className="auto-gate-plan auto-gate-plan--team">
                                    <div className="auto-gate-plan-badge">Most Popular</div>
                                    <div className="auto-gate-plan-name">Team</div>
                                    <div className="auto-gate-plan-price">$79<span>/mo</span></div>
                                    <div className="auto-gate-plan-detail">500 scan credits/mo · Priority support</div>
                                </div>
                            </div>
                            <Link to="/dashboard/pricing" className="btn-primary-neon" style={{ marginTop: '1.5rem', display: 'inline-flex', textDecoration: 'none' }}>
                                ⚡ Upgrade Plan
                            </Link>
                        </div>
                    )}

                    {/* Schedules */}
                    {isPaidPlan && (
                        <>
                            <div className="auto-intro">
                                <Zap size={20} color="#00d65b" />
                                <div>
                                    <strong>Automated Scans</strong> — Set up recurring scans for each cloud account.
                                    After every scan, a detailed email report will be sent to your notify address.
                                </div>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                                    <RefreshCw size={24} className="spin" style={{ marginBottom: '1rem' }} />
                                    <p>Loading accounts...</p>
                                </div>
                            ) : accounts.length === 0 ? (
                                <div className="auto-empty">
                                    <Cloud size={40} color="#d1d5db" />
                                    <p>No cloud accounts connected yet.</p>
                                    <Link to="/dashboard/accounts" className="btn-primary-neon" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: '0.75rem' }}>
                                        + Connect an Account
                                    </Link>
                                </div>
                            ) : (
                                <div className="auto-cards">
                                    {accounts.map(acc => {
                                        const s = schedules[acc.id] || {};
                                        const isSaving = saving[acc.id];
                                        const isSaved = saved[acc.id];

                                        return (
                                            <div key={acc.id} className={`auto-card ${s.enabled ? 'auto-card--enabled' : ''}`}>
                                                {/* Card Header */}
                                                <div className="auto-card-header">
                                                    <div className="auto-card-identity">
                                                        <div className="auto-card-icon">
                                                            <Cloud size={20} color="#0284c7" />
                                                        </div>
                                                        <div>
                                                            <div className="auto-card-name">{acc.name}</div>
                                                            <div className="auto-card-meta">
                                                                <span className="auto-card-provider">{acc.provider || 'AWS'}</span>
                                                                · {acc.region || 'us-east-1'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Toggle */}
                                                    <button
                                                        className={`auto-toggle ${s.enabled ? 'auto-toggle--on' : ''}`}
                                                        onClick={() => handleToggle(acc.id)}
                                                        title={s.enabled ? 'Disable automation' : 'Enable automation'}
                                                    >
                                                        {s.enabled
                                                            ? <ToggleRight size={32} color="#00d65b" />
                                                            : <ToggleLeft size={32} color="#9ca3af" />}
                                                        <span>{s.enabled ? 'Enabled' : 'Disabled'}</span>
                                                    </button>
                                                </div>

                                                {/* Config */}
                                                <div className="auto-card-body">
                                                    {/* Frequency */}
                                                    <div className="auto-field">
                                                        <label className="auto-label">
                                                            <Clock size={13} /> Scan Frequency
                                                        </label>
                                                        <div className="auto-freq-group">
                                                            {FREQUENCY_OPTIONS.map(opt => (
                                                                <button
                                                                    key={opt.value}
                                                                    className={`auto-freq-btn ${s.frequency === opt.value ? 'auto-freq-btn--active' : ''}`}
                                                                    onClick={() => handleChange(acc.id, 'frequency', opt.value)}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="auto-freq-desc">
                                                            {FREQUENCY_OPTIONS.find(o => o.value === s.frequency)?.desc}
                                                        </div>
                                                    </div>

                                                    {/* Notify Email */}
                                                    <div className="auto-field">
                                                        <label className="auto-label">
                                                            <Mail size={13} /> Report Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            className="auto-input"
                                                            placeholder="you@example.com"
                                                            value={s.notify_email || ''}
                                                            onChange={e => handleChange(acc.id, 'notify_email', e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Last Run */}
                                                    {s.last_run_at && (
                                                        <div className="auto-last-run">
                                                            <CheckCircle2 size={13} color="#00d65b" />
                                                            Last run: {new Date(s.last_run_at).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Save */}
                                                <div className="auto-card-footer">
                                                    <button
                                                        className={`auto-save-btn ${isSaved ? 'auto-save-btn--saved' : ''}`}
                                                        onClick={() => handleSave(acc.id)}
                                                        disabled={isSaving}
                                                    >
                                                        {isSaving
                                                            ? <><RefreshCw size={14} className="spin" /> Saving...</>
                                                            : isSaved
                                                                ? <><CheckCircle2 size={14} /> Saved!</>
                                                                : <><Save size={14} /> Save Settings</>}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Automation;
