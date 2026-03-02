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

    // Stats
    const [totalZombies, setTotalZombies] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);
    const [reapedSavings, setReapedSavings] = useState(0);

    const fetchZombies = async () => {
        if (!user?.user_metadata?.tenant_id) return;
        setLoading(true);
        try {
            const data = await api.getAllZombies(user.user_metadata.tenant_id);
            // To match the mockup visually while loading real data, user might want fake mock data if db is empty.
            // But let's use the real data from DB, we just format it beautifully.
            setZombies(data);

            let active = 0;
            let savings = 0;
            let recovered = 0;

            data.forEach(z => {
                if (z.status === 'pending') {
                    active++;
                    savings += (z.estimated_monthly_cost || 0);
                } else if (z.status === 'reaped') {
                    recovered += (z.estimated_monthly_cost || 0);
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

    useEffect(() => {
        if (user?.user_metadata?.tenant_id) {
            fetchZombies();
        }
    }, [user]);

    const handleReap = async (zombieId) => {
        setReapingId(zombieId);
        try {
            await api.reapZombie(zombieId);
            setTimeout(() => fetchZombies(), 1000);
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
                    <a href="#" className="dash-nav-item">
                        <Cloud size={18} /> Cloud Accounts
                    </a>
                    <a href="#" className="dash-nav-item">
                        <Zap size={18} /> Automation
                    </a>
                    <a href="#" className="dash-nav-item">
                        <BarChart2 size={18} /> Reports
                    </a>
                </nav>

                <div className="dash-nav-label">SYSTEM</div>
                <nav className="dash-nav-group">
                    <a href="#" className="dash-nav-item">
                        <Settings size={18} /> Settings
                    </a>
                    <a href="#" className="dash-nav-item">
                        <Users size={18} /> Team
                    </a>
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
                    <h1>Fleet Command</h1>
                    <div className="dash-header-actions">
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
                                <span className="dash-metric-trend trend-down">↑ 12%</span>
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
                                ${totalSavings.toFixed(2)}
                            </div>
                            <div className="dash-metric-subtitle">
                                Projected annual waste: ${(totalSavings * 12).toLocaleString()}
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
                            <div className="dash-metric-progress">
                                <div className="progress-bar-container">
                                    <div className="progress-bar-fill" style={{ width: '75%' }}></div>
                                </div>
                                <span>75% of monthly goal reached</span>
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
                                                    {z.cloud_accounts?.account_alias || 'Unknown'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                ${z.estimated_monthly_cost?.toFixed(2)}
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
                                                    // In mockup it's just a 3-dot menu or an action. We'll leave the reap button for UX, but stylized, or just 3 dots.
                                                    // Let's hide the direct "Reap" button behind a subtle dots or keep it if they want to reap. The mockup shows 3 vertical dots.
                                                    <button className="dash-icon-btn-small" title="Actions" onClick={() => handleReap(z.id)}>
                                                        {reapingId === z.id ? <RefreshCw size={18} className="spin" /> : <MoreVertical size={18} />}
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
        </div>
    );
};

export default Dashboard;
