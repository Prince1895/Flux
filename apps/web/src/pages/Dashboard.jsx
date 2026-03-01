import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { LogOut, Plus, RefreshCw, ZapOff, Server, HardDrive } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [zombies, setZombies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reapingId, setReapingId] = useState(null);

    // Stats
    const [totalZombies, setTotalZombies] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);
    const [reapedSavings, setReapedSavings] = useState(0);

    const fetchZombies = async () => {
        setLoading(true);
        try {
            const data = await api.getAllZombies();
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
        fetchZombies();
    }, []);

    const handleReap = async (zombieId) => {
        setReapingId(zombieId);
        try {
            await api.reapZombie(zombieId);
            // Wait a moment for UX, then refresh
            setTimeout(() => fetchZombies(), 1000);
        } catch (err) {
            alert(`Reap Failed: ${err.message || 'Unknown error'}`);
        } finally {
            setReapingId(null);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>Fleet Command</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.email}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/dashboard/connect" className="btn btn-outline">
                        <Plus size={18} /> Add AWS Account
                    </Link>
                    <button onClick={logout} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>ACTIVE ZOMBIES</p>
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--danger)' }}>{totalZombies}</div>
                </div>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>WASTED SPEND (MONTHLY)</p>
                    <div style={{ fontSize: '3rem', fontWeight: 700, className: "gradient-text" }}>
                        ${totalSavings.toFixed(2)}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--primary-neon)', background: 'rgba(16, 185, 129, 0.05)' }}>
                    <p style={{ color: 'var(--primary-neon)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>CASH RECOVERED</p>
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: '#fff' }}>
                        ${reapedSavings.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem' }}>Detected Resources</h2>
                    <button onClick={fetchZombies} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>RESOURCE</th>
                            <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>REGION</th>
                            <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>ACCOUNT</th>
                            <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>MONTHLY COST</th>
                            <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>STATUS</th>
                            <th style={{ padding: '1rem 2rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading scanner data...</td></tr>
                        ) : zombies.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No resources found. Your infrastructure is clean!</td></tr>
                        ) : (
                            zombies.map(z => (
                                <tr key={z.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {z.resource_type === 'ebs_volume' ? <HardDrive size={18} color="var(--text-muted)" /> : <Server size={18} color="var(--text-muted)" />}
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{z.external_id}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{z.resource_type.replace('_', ' ').toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)' }}>{z.region}</td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                                            {z.cloud_accounts?.account_alias || 'Unknown'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem', fontWeight: 600 }}>
                                        ${z.estimated_monthly_cost}
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        {z.status === 'pending' ? (
                                            <span style={{ color: 'var(--danger)', background: 'var(--danger-glow)', padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ ZOMBIE</span>
                                        ) : (
                                            <span style={{ color: 'var(--primary-neon)', background: 'rgba(16,185,129,0.1)', border: '1px solid var(--primary-neon)', padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>✓ REAPED</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                        {z.status === 'pending' && (
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                onClick={() => handleReap(z.id)}
                                                disabled={reapingId === z.id}
                                            >
                                                {reapingId === z.id ? 'Terminating...' : <><ZapOff size={14} /> Reap Now</>}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
