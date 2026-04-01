import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import {
    Activity, LayoutDashboard, Cloud, Zap, BarChart2, Settings, Users,
    LogOut, Send, Mail, CheckCircle2, DollarSign
} from 'lucide-react';
import '../styles/dashboard.css';

const Reports = () => {
    const { user, logout } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState(null);
    const [sentStatus, setSentStatus] = useState({}); // { accountId: boolean }

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await api.getReportSummary();
                setAccounts(data);
            } catch (err) {
                console.error("Failed to load reports summary", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const handleSendReport = async (accountId) => {
        setSendingId(accountId);
        try {
            await api.sendManualReport(accountId);
            setSentStatus(prev => ({ ...prev, [accountId]: true }));
            setTimeout(() => {
                setSentStatus(prev => ({ ...prev, [accountId]: false }));
            }, 3000); // hide success check after 3s
        } catch (err) {
            alert('Failed to queue report email. ' + (err.response?.data?.error || err.message));
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div className="dash-layout">
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
                    <Link to="/dashboard/automation" className="dash-nav-item">
                        <Zap size={18} /> Automation
                    </Link>
                    <Link to="/dashboard/reports" className="dash-nav-item active">
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

            <main className="dash-main">
                <header className="dash-header">
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Scan Reports</h1>
                        <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6b7280' }}>
                            View summary and dispatch manual email reports to your inbox.
                        </p>
                    </div>
                </header>

                <div className="dash-content-scroll" style={{ padding: '2rem' }}>
                    <div className="dash-table-container">
                        <div className="dash-table-header">
                            <h2>Email Reports Manager</h2>
                        </div>
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>CLOUD ACCOUNT</th>
                                    <th>PROVIDER</th>
                                    <th>ACTIVE ZOMBIES</th>
                                    <th>WASTED SPEND / MO</th>
                                    <th style={{ textAlign: 'right' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading summaries...</td></tr>
                                ) : accounts.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No cloud accounts connected.</td></tr>
                                ) : (
                                    accounts.map(acc => (
                                        <tr key={acc.id}>
                                            <td style={{ fontWeight: 600 }}>{acc.account_alias || acc.name}</td>
                                            <td>
                                                <span className="account-badge">
                                                    {acc.provider.toUpperCase()} ({acc.region})
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ color: acc.active_zombies_count > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                                                    {acc.active_zombies_count}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                ${Number(acc.estimated_waste || 0).toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleSendReport(acc.id)}
                                                    disabled={sendingId === acc.id || sentStatus[acc.id]}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                                        padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                                                        border: 'none', cursor: (sendingId === acc.id || sentStatus[acc.id]) ? 'not-allowed' : 'pointer',
                                                        backgroundColor: sentStatus[acc.id] ? '#dcfce7' : '#111827',
                                                        color: sentStatus[acc.id] ? '#15803d' : '#ffffff',
                                                        transition: 'background 0.2s', width: '130px'
                                                    }}
                                                >
                                                    {sendingId === acc.id ? (
                                                        'Queueing...'
                                                    ) : sentStatus[acc.id] ? (
                                                        <><CheckCircle2 size={14} /> Queued</>
                                                    ) : (
                                                        <><Mail size={14} /> Send Report</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;
