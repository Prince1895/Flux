import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import '../styles/globals.css';
import { CheckCircle2, Zap } from 'lucide-react';

const Pricing = () => {
    const [loading, setLoading] = useState(false);
    const [currentPlan, setCurrentPlan] = useState('starter');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch current plan status
        api.getBillingStatus().then(res => {
            if (res && res.plan) {
                setCurrentPlan(res.plan);
            }
        }).catch(err => console.error(err));
    }, []);

    const handleUpgrade = async (planName) => {
        if (planName === currentPlan) return;
        setLoading(true);
        try {
            await api.upgradePlan(planName);
            alert(`Successfully upgraded to ${planName}!`);
            navigate('/dashboard');
        } catch (err) {
            alert(err.message || 'Upgrade failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Pricing that wraps to your scale</h1>
                <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '4rem' }}>
                    Choose the plan that fits your cloud footprint. Maximize savings with automated reaping.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>

                    {/* Starter Plan */}
                    <div style={{ border: '1px solid #27272a', borderRadius: '12px', padding: '2rem', background: '#18181b', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Starter</h2>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Free</div>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Perfect for individuals exploring cloud cost optimization.</p>

                        <button
                            disabled={currentPlan === 'starter' || loading}
                            onClick={() => handleUpgrade('starter')}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid #3f3f46', background: currentPlan === 'starter' ? '#3f3f46' : 'transparent',
                                color: '#fff', cursor: 'pointer', marginBottom: '2rem', fontWeight: 'bold'
                            }}
                        >
                            {currentPlan === 'starter' ? 'Current Plan' : 'Downgrade'}
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#10b981" /> 5 free scans / month</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#10b981" /> Manual Dashboard Reaping</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#10b981" /> 1 Cloud Account Limit</div>
                        </div>
                    </div>

                    {/* Solo Plan */}
                    <div style={{ border: '2px solid #10b981', borderRadius: '12px', padding: '2rem', background: '#18181b', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#000', padding: '0.2rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Zap size={14} /> MOST RECOMMENDED
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Solo</h2>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>$49<span style={{ fontSize: '1rem', color: '#a1a1aa' }}>/mo</span></div>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>For growing projects and indie developers managing infrastructure.</p>

                        <button
                            disabled={currentPlan === 'solo' || loading}
                            onClick={() => handleUpgrade('solo')}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: 'none', background: currentPlan === 'solo' ? '#3f3f46' : '#10b981',
                                color: currentPlan === 'solo' ? '#fff' : '#000', cursor: 'pointer', marginBottom: '2rem', fontWeight: 'bold'
                            }}
                        >
                            {currentPlan === 'solo' ? 'Current Plan' : 'Upgrade to Solo'}
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#10b981" /> 50 scans / month</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#10b981" /> 1-Click bulk reaping</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#10b981" /> Up to 5 Cloud Accounts</div>
                        </div>
                    </div>

                    {/* Team Plan */}
                    <div style={{ border: '1px solid #27272a', borderRadius: '12px', padding: '2rem', background: '#18181b', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Team</h2>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>$199<span style={{ fontSize: '1rem', color: '#a1a1aa' }}>/mo</span></div>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Unlimited scaling and team collaboration for enterprise workloads.</p>

                        <button
                            disabled={currentPlan === 'team' || loading}
                            onClick={() => handleUpgrade('team')}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid #3f3f46', background: currentPlan === 'team' ? '#3f3f46' : 'transparent',
                                color: '#fff', cursor: 'pointer', marginBottom: '2rem', fontWeight: 'bold'
                            }}
                        >
                            {currentPlan === 'team' ? 'Current Plan' : 'Upgrade to Team'}
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#10b981" /> 500 scans / month</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#10b981" /> Automated scheduling rules</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#10b981" /> Unlimited Cloud Accounts</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Pricing;
