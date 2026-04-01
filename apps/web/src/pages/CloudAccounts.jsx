import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import {
    Activity, LayoutDashboard, Cloud, Zap, BarChart2, Settings, Users,
    LogOut, Plus, RefreshCw, Trash2, AlertCircle, CheckCircle2, Server,
    ExternalLink
} from 'lucide-react';
import ConnectModal from '../components/ConnectModal';
import '../styles/dashboard.css';

const providerColors = {
    aws: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', label: 'AWS' },
    gcp: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'GCP' },
    azure: { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', label: 'Azure' },
};

const CloudAccounts = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [scanningId, setScanningId] = useState(null);
    const [error, setError] = useState('');

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const data = await api.getAccounts();
            setAccounts(data);
        } catch (err) {
            setError(err.message || 'Failed to load accounts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAccounts(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this cloud account? This will not delete any AWS resources, only disconnect it from Flux.')) return;
        setDeletingId(id);
        try {
            await api.deleteAccount(id);
            setAccounts(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert('Failed to remove account: ' + (err.message || 'Unknown error'));
        } finally {
            setDeletingId(null);
        }
    };

    const handleScan = async (id) => {
        setScanningId(id);
        try {
            await api.runScan(id);
            alert('Scan started! Refresh in a moment to see new zombie resources.');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                if (window.confirm("You have run out of scan credits! Would you like to upgrade your plan?")) {
                    navigate('/dashboard/pricing');
                }
            } else {
                alert('Scan failed: ' + (err.response?.data?.error || err.message || 'Unknown error'));
            }
        } finally {
            setScanningId(null);
        }
    };

    const navItem = (label, icon, href, active = false) => (
        <a href={href} className={`dash-nav-item${active ? ' active' : ''}`}>
            {icon} {label}
        </a>
    );

    return (
        <div className="dash-layout">
            {/* Sidebar */}
            <aside className="dash-sidebar">
                <div className="dash-brand">
                    <Activity color="var(--brand-green, #10b981)" size={24} />
                    <span>Flux</span>
                </div>
                <nav className="dash-nav-group">
                    <Link to="/dashboard" className="dash-nav-item"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/dashboard/accounts" className="dash-nav-item active"><Cloud size={18} /> Cloud Accounts</Link>
                    <a href="/dashboard/automation" className="dash-nav-item"><Zap size={18} /> Automation</a>
                    <Link to="/dashboard/reports" className="dash-nav-item">
                        <BarChart2 size={18} /> Reports
                    </Link>
                </nav>
                <div className="dash-nav-label">SYSTEM</div>
                <nav className="dash-nav-group">
                    <a href="#" className="dash-nav-item"><Settings size={18} /> Settings</a>
                    <a href="#" className="dash-nav-item"><Users size={18} /> Team</a>
                </nav>
                <div className="dash-sidebar-footer">
                    <div className="dash-user-profile">
                        <div className="dash-user-avatar">{user?.email?.charAt(0).toUpperCase() || 'U'}</div>
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
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Cloud Accounts</h1>
                        <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6b7280', fontWeight: 400 }}>
                            Manage all connected cloud accounts
                        </p>
                    </div>
                    <div className="dash-header-actions">
                        <button onClick={() => setIsConnectModalOpen(true)} className="btn-primary-neon" style={{ border: 'none', cursor: 'pointer' }}>
                            <Plus size={16} /> Connect Account
                        </button>
                    </div>
                </header>

                <div className="dash-content-scroll" style={{ padding: '2rem' }}>

                    {/* Summary Bar */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Total Accounts', value: accounts.length, color: '#111827' },
                            { label: 'AWS', value: accounts.filter(a => a.provider === 'aws').length, color: '#c2410c' },
                            { label: 'GCP', value: accounts.filter(a => a.provider === 'gcp').length, color: '#1d4ed8' },
                            { label: 'Azure', value: accounts.filter(a => a.provider === 'azure').length, color: '#0369a1' },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '1rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', minWidth: '120px' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    {/* Accounts Grid */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                            <RefreshCw size={24} className="spin" style={{ marginBottom: '1rem' }} />
                            <p>Loading accounts...</p>
                        </div>
                    ) : accounts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '16px' }}>
                            <Cloud size={40} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>No accounts connected yet</h3>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Connect your first cloud account to start detecting zombie resources.
                            </p>
                            <button onClick={() => setIsConnectModalOpen(true)} className="btn-primary-neon" style={{ border: 'none', cursor: 'pointer' }}>
                                <Plus size={16} /> Connect Your First Account
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                            {accounts.map(account => {
                                const p = providerColors[account.provider] || providerColors.aws;
                                return (
                                    <div key={account.id} style={{
                                        background: '#fff', border: '1px solid #e5e7eb',
                                        borderRadius: '14px', padding: '1.5rem',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                        display: 'flex', flexDirection: 'column', gap: '1rem',
                                        transition: 'box-shadow 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
                                    >
                                        {/* Card Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: p.bg, border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Server size={20} color={p.text} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>
                                                        {account.account_alias || 'Unnamed Account'}
                                                    </div>
                                                    <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: p.bg, color: p.text, border: `1px solid ${p.border}`, marginTop: '3px' }}>
                                                        {p.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <div className="dot dot-green" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d65b' }}></div>
                                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Connected</span>
                                            </div>
                                        </div>

                                        {/* Account ID */}
                                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.6rem 0.9rem' }}>
                                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Account ID</div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#374151', wordBreak: 'break-all' }}>
                                                {account.id}
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
                                            <span>🗓 Added {new Date(account.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
                                            <button
                                                onClick={() => handleScan(account.id)}
                                                disabled={scanningId === account.id}
                                                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                                            >
                                                {scanningId === account.id
                                                    ? <><RefreshCw size={13} className="spin" /> Scanning...</>
                                                    : <><RefreshCw size={13} /> Re-scan</>}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(account.id)}
                                                disabled={deletingId === account.id}
                                                style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                                            >
                                                {deletingId === account.id ? <RefreshCw size={13} className="spin" /> : <Trash2 size={13} />}
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add Another Card */}
                            <div
                                onClick={() => setIsConnectModalOpen(true)}
                                style={{
                                    background: '#fafafa', border: '2px dashed #e5e7eb',
                                    borderRadius: '14px', padding: '1.5rem',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    gap: '0.75rem', cursor: 'pointer', minHeight: '180px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#00d65b'; e.currentTarget.style.background = '#f0fdf4'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fafafa'; }}
                            >
                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plus size={22} color="#9ca3af" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.9rem' }}>Connect another account</div>
                                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '3px' }}>AWS, GCP, Azure</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {isConnectModalOpen && (
                <ConnectModal onClose={() => { setIsConnectModalOpen(false); fetchAccounts(); }} />
            )}
        </div>
    );
};

export default CloudAccounts;
