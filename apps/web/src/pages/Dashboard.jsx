import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import {
    Activity, LayoutDashboard, Cloud, Zap, BarChart2, Settings, Users,
    LogOut, Plus, RefreshCw, MoreVertical, Search, Bell, Sun,
    Server, HardDrive, AlertCircle, CheckCircle2, DollarSign
} from 'lucide-react';
import ConnectModal from '../components/ConnectModal';
import '../styles/dashboard.css';


const Dashboard = () => {
    const { user, logout } = useAuth();
    const [zombies, setZombies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reapingId, setReapingId] = useState(null);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [tenantName, setTenantName] = useState('');
    const [reapTarget, setReapTarget] = useState(null); // zombie to confirm reap for

    // Stats
    const [totalZombies, setTotalZombies] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);
    const [reapedSavings, setReapedSavings] = useState(0);

    // Billing
    const [scanCredits, setScanCredits] = useState(0);
    const [tenantPlan, setTenantPlan] = useState('starter');

    const fetchZombies = async () => {
        if (!user?.tenant_id) return;
        setLoading(true);
        try {
            const data = await api.getAllZombies(); // No need to pass tenant_id, auth token has it
            setZombies(data);

            let active = 0;
            let savings = 0;
            let recovered = 0;

            data.forEach(z => {
                if (z.status === 'pending') {
                    active++;
                    savings += Number(z.estimated_monthly_cost || 0);
                } else if (z.status === 'reaped') {
                    recovered += Number(z.estimated_monthly_cost || 0);
                }
            });

            setTotalZombies(active);
            setTotalSavings(savings);
            setReapedSavings(recovered);
        } catch (err) {
            console.error('Failed to load zombies', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBilling = async () => {
        try {
            const b = await api.getBillingStatus();
            setScanCredits(b.scan_credits || 0);
            setTenantPlan(b.plan || 'starter');
        } catch (e) {
            console.error('Failed to fetch billing', e);
        }
    };

    useEffect(() => {
        fetchZombies();
        if (user?.company_name) setTenantName(user.company_name);
        fetchBilling();
    }, []);

    const handleReap = async (zombieId) => {
        setReapingId(zombieId);
        setReapTarget(null);
        try {
            await api.reapZombie(zombieId);
            setTimeout(() => {
                fetchZombies();
                fetchBilling();
            }, 1000);
        } catch (err) {
            alert(`Reap Failed: ${err.message || 'Unknown error'}`);
        } finally {
            setReapingId(null);
        }
    };

    return (
        <div className="dash-layout">

            {/* Sidebar */}
            <aside className="dash-sidebar">
                <div className="dash-brand">
                    <Activity color="var(--brand-green, #10b981)" size={24} />
                    <span>Flux</span>
                </div>

                <nav className="dash-nav-group">
                    <a href="#" className="dash-nav-item active">
                        <LayoutDashboard size={18} /> Overview
                    </a>
                    <Link to="/dashboard/accounts" className="dash-nav-item">
                        <Cloud size={18} /> Cloud Accounts
                    </Link>
                    <Link to="/dashboard/automation" className="dash-nav-item">
                        <Zap size={18} /> Automation
                    </Link>
                    <Link to="/dashboard/reports" className="dash-nav-item">
                        <BarChart2 size={18} /> Reports
                    </Link>
                </nav>

                <div className="dash-nav-label">SYSTEM</div>
                <nav className="dash-nav-group">
                    <a href="#" className="dash-nav-item">
                        <Settings size={18} /> Settings
                    </a>
                    <a href="#" className="dash-nav-item">
                        <Users size={18} /> Team
                    </a>
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
                            <div className="dash-user-email" title={user?.email || 'test@yourcompany.com'}>
                                {user?.email || 'test@yourcompany.com'}
                            </div>
                            <div className="dash-user-role">Admin</div>
                        </div>
                        <button onClick={logout} className="dash-logout-btn" title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dash-main">

                {/* Header */}
                <header className="dash-header">
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                            {user?.company_name
                                ? `Hey, ${user.company_name.split(' ')[0]} 👋`
                                : user?.email?.split('@')[0]
                                    ? `Hey, ${user.email.split('@')[0]} 👋`
                                    : 'Fleet Command'}
                        </h1>
                        {tenantName && (
                            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6b7280', fontWeight: 400 }}>
                                {tenantName}'s Fleet Command
                            </p>
                        )}
                    </div>
                    <div className="dash-header-actions" style={{ alignItems: 'center' }}>
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', gap: '0.6rem', alignItems: 'center', marginRight: '0.5rem', color: '#374151', fontWeight: 600 }}>
                            <div style={{ background: tenantPlan === 'starter' ? '#e5e7eb' : '#dcfce7', color: tenantPlan === 'starter' ? '#4b5563' : '#15803d', border: `1px solid ${tenantPlan === 'starter' ? '#d1d5db' : '#bbf7d0'}`, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{tenantPlan}</div>
                            <span>{scanCredits} Credits Left</span>
                        </div>
                        <button className="dash-icon-btn"><Sun size={20} /></button>
                        <button className="dash-icon-btn" style={{ position: 'relative' }}>
                            <Bell size={20} />
                            <span className="dash-notification-dot"></span>
                        </button>
                        <button onClick={() => setIsConnectModalOpen(true)} className="btn-primary-neon" style={{ border: 'none', cursor: 'pointer' }}>
                            <Plus size={16} /> Connect Cloud Account
                        </button>
                    </div>
                </header>

                <div className="dash-content-scroll">

                    {/* Metrics Row */}
                    <div className="dash-metrics-grid">

                        <div className="dash-metric-card">
                            <div className="dash-metric-header">
                                <span>ACTIVE ZOMBIES</span>
                                <div className="dash-metric-icon bg-danger-dim text-danger">
                                    <AlertCircle size={20} />
                                </div>
                            </div>
                            <div className="dash-metric-value">
                                {totalZombies}
                            </div>
                            <div className="dash-metric-subtitle">
                                Resources idle &gt; 30 days
                            </div>
                        </div>

                        <div className="dash-metric-card">
                            <div className="dash-metric-header">
                                <span>WASTED SPEND (MONTHLY)</span>
                                <div className="dash-metric-icon text-muted">
                                    {/* Abstract broken link/bone icon placeholder */}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 4 4" /><path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13" /><path d="m9 19 4 4" /><path d="m11 17 4.3 4.3a2.41 2.41 0 0 0 3.4 0l2.6-2.6a2.41 2.41 0 0 0 0-3.4L17 11" /></svg>
                                </div>
                            </div>
                            <div className="dash-metric-value">
                                ${Number(totalSavings).toFixed(2)}
                            </div>
                            <div className="dash-metric-subtitle" style={{ color: 'red' }}>
                                Projected annual waste: ${(Number(totalSavings) * 12).toLocaleString()}
                            </div>
                        </div>

                        <div className="dash-metric-card card-highlighted">
                            <div className="dash-metric-header">
                                <span className="text-neon">CASH RECOVERED</span>
                                <div className="dash-metric-icon bg-warning text-dark" style={{ background: '#eab308', color: '#000' }}>
                                    <DollarSign size={20} />
                                </div>
                            </div>
                            <div className="dash-metric-value text-neon" style={{ fontSize: '2.5rem' }}>
                                ${reapedSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>

                        </div>

                    </div>

                    {/* Table Section */}
                    <div className="dash-table-container">
                        <div className="dash-table-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h2>Detected Resources</h2>
                                <span className="dash-badge badge-critical">{totalZombies} Critical</span>
                            </div>
                            <div className="dash-table-actions">
                                <div className="dash-search-box">
                                    <Search size={16} />
                                    <input type="text" placeholder="Search resources..." />
                                </div>
                                <button onClick={fetchZombies} className="dash-btn-outline">
                                    <RefreshCw size={16} /> Refresh
                                </button>
                            </div>
                        </div>

                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>RESOURCE</th>
                                    <th>REGION</th>
                                    <th>ACCOUNT</th>
                                    <th>MONTHLY COST</th>
                                    <th>STATUS</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && zombies.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading resources...</td></tr>
                                ) : zombies.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No resources found.</td></tr>
                                ) : (
                                    zombies.map(z => (
                                        <tr key={z.id}>
                                            <td>
                                                <div className="td-resource">
                                                    <div className={`resource-icon ${z.resource_type === 'ebs_volume' ? 'bg-blue-dim' : z.resource_type.includes('snapshot') ? 'bg-indigo-dim' : 'bg-orange-dim'}`}>
                                                        {z.resource_type === 'ebs_volume' ? <HardDrive size={16} /> : z.resource_type.includes('snapshot') ? <Server size={16} /> : <Server size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="resource-id">{z.external_id}</div>
                                                        <div className="resource-type">
                                                            {z.resource_type.replace('_', ' ').toUpperCase()} • {z.resource_type === 'ebs_volume' ? 'Unattached' : 'Orphaned'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-secondary">{z.region}</td>
                                            <td>
                                                <span className="account-badge">
                                                    {z.account_alias || 'Unknown'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                ${Number(z.estimated_monthly_cost || 0).toFixed(2)}
                                            </td>
                                            <td>
                                                {z.status === 'reaped' ? (
                                                    <span className="status-dot-badge border-green">
                                                        <span className="dot dot-green"></span> Reaped
                                                    </span>
                                                ) : z.status === 'pending' ? (
                                                    <span className="status-dot-badge border-red">
                                                        <span className="dot dot-red"></span> Zombie
                                                    </span>
                                                ) : (
                                                    <span className="status-dot-badge border-yellow">
                                                        <span className="dot dot-yellow"></span> Review
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {z.status === 'pending' ? (
                                                    <button
                                                        className="reap-btn"
                                                        title="Reap this resource"
                                                        onClick={() => setReapTarget(z)}
                                                        disabled={!!reapingId}
                                                    >
                                                        {reapingId === z.id
                                                            ? <RefreshCw size={14} className="spin" />
                                                            : '⚡ Reap'}
                                                    </button>
                                                ) : (
                                                    <button className="dash-icon-btn-small" title="Actions">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <div className="dash-table-footer">
                            <span>Showing {zombies.length > 0 ? 1 : 0}-{zombies.length} of {zombies.length} detected resources</span>
                            <div className="pagination-arrows">
                                <button>&lt;</button>
                                <button>&gt;</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isConnectModalOpen && (
                <ConnectModal onClose={() => setIsConnectModalOpen(false)} />
            )}

            {/* ── Reap Confirmation Modal ── */}
            {reapTarget && (
                <div className="reap-modal-overlay" onClick={() => setReapTarget(null)}>
                    <div className="reap-modal" onClick={e => e.stopPropagation()}>
                        <div className="reap-modal-icon">⚠️</div>
                        <h2 className="reap-modal-title">Permanently Delete Resource?</h2>
                        <p className="reap-modal-body">
                            You are about to <strong>permanently delete</strong> the following AWS resource.
                            This action <strong>cannot be undone</strong>.
                        </p>
                        <div className="reap-modal-resource-box">
                            <div className="reap-modal-resource-type">
                                {reapTarget.resource_type.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className="reap-modal-resource-id">{reapTarget.external_id}</div>
                            <div className="reap-modal-resource-meta">
                                {reapTarget.region} &nbsp;•&nbsp; ~${Number(reapTarget.estimated_monthly_cost || 0).toFixed(2)}/mo
                            </div>
                        </div>
                        {reapTarget.resource_type === 'ec2_instance' && (
                            <p className="reap-modal-danger-note">
                                🔴 <strong>Warning:</strong> Terminating an EC2 instance will also delete its root EBS volume if <code>DeleteOnTermination</code> is enabled.
                            </p>
                        )}
                        <div className="reap-modal-actions">
                            <button className="reap-modal-cancel" onClick={() => setReapTarget(null)}>Cancel</button>
                            <button
                                className="reap-modal-confirm"
                                onClick={() => handleReap(reapTarget.id)}
                                disabled={!!reapingId}
                            >
                                {reapingId === reapTarget.id
                                    ? <><RefreshCw size={14} className="spin" /> Reaping...</>
                                    : '⚡ Yes, Reap It'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
