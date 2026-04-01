import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Play, ArrowRight, Trash2, TrendingUp, LineChart, X, Network, BarChart3, SlidersHorizontal, CheckCircle2, Zap } from 'lucide-react';
import '../styles/landing.css';

const Home = () => {
    const [activeModal, setActiveModal] = useState(null);
    const [userCount, setUserCount] = useState(0);

    useEffect(() => {
        fetch('http://localhost:4000/api/public/stats')
            .then(res => res.json())
            .then(data => setUserCount(data.users))
            .catch(err => console.error('Failed to fetch stats:', err));
    }, []);

    const modalData = {
        reaper: {
            title: 'Storage Reaper',
            bullets: [
                'Scans across all configured AWS regions automatically.',
                'Identifies unattached EBS volumes and idle Elastic IPs.',
                'Deletes targeted resources securely with full audit logs.',
                'Prevents accidental deletion with customizable safety tags.'
            ]
        },
        scaling: {
            title: 'Auto-Scaling',
            bullets: [
                'Monitors CPU and Memory usage 24/7 across your instances.',
                'Automatically scales down workloads during off-peak hours.',
                'Recommends right-sizing for consistently underutilized resources.',
                'Integrates seamlessly with existing Auto-Scaling Groups.'
            ]
        },
        analytics: {
            title: 'Cost Analytics',
            bullets: [
                'Generates daily, weekly, and monthly storage cost reports.',
                'Forecasts future spend based on historical consumption trends.',
                'Highlights resource types with the highest potential savings.',
                'Exports ready-to-present visuals for your finance team.'
            ]
        }
    };

    return (
        <div className="landing-page">

            {/* Navigation Bar */}
            <nav className="landing-nav">
                <Link to="/" className="logo-area" style={{ flex: 1 }}>
                    <Activity color="var(--brand-green, #10b981)" size={24} />
                    Flux
                </Link>
                <div className="landing-nav-links">
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="/docs">Docs</a>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Link to="/login" className="landing-btn-login">Login</Link>
                    <Link to="/signup" className="landing-btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Activity size={12} /> NEW: REAPER ENGINE 1.0
                    </div>
                    <h1 className="hero-title">
                        Optimize Your <br /><span className="text-brand">Cloud</span><br /> with Flux
                    </h1>
                    <p className="hero-subtitle">
                        The enterprise-grade reaper engine that slashes storage costs by up to 60% through intelligent lifecycle management and automated data tiering.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/login" className="landing-btn-primary">Start Free Trial</Link>
                        <a href="#demo" className="landing-btn-secondary">
                            <Play size={18} /> View Demo
                        </a>
                    </div>
                </div>

                <div className="hero-graphic">
                    <div className="hero-circle-bg"></div>
                    <div className="hero-icon-main">
                        <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor" opacity="0.9">
                            <path d="M17.5 19H6.5C4.57 19 3 17.43 3 15.5c0-1.85 1.44-3.36 3.26-3.48C6.39 9.15 8.85 7 12 7c3.15 0 5.61 2.15 5.74 5.02 1.82.12 3.26 1.63 3.26 3.48 0 1.93-1.57 3.5-3.5 3.5z" />
                        </svg>
                    </div>
                    <div className="floating-badge badge-top-right">
                        <Activity size={24} />
                    </div>
                    <div className="floating-badge badge-bottom-left" style={{ padding: '0.5rem 1rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#10b981' }}>$</span>
                    </div>
                </div>
            </section>

            {/* 3 Step Features */}
            <section className="features-section" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
                <div className="features-label">EFFICIENCY IN MOTION</div>
                <h2 className="features-title" style={{ margin: '0 auto 1.5rem' }}>Intelligent resource reclamation in three steps</h2>
                <p className="features-subtitle" style={{ margin: '0 auto 4rem', maxWidth: '600px', color: '#4b5563', lineHeight: 1.6 }}>
                    Flux connects to your cloud provider and automatically manages your storage<br />lifecycle without any manual intervention.
                </p>

                <div className="features-grid" style={{ textAlign: 'left' }}>
                    <div className="feature-card">
                        <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>
                            <Network size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>1. Connect</h3>
                        <p style={{ marginBottom: '1.5rem', flexGrow: 1, color: '#4b5563', lineHeight: 1.6, fontSize: '0.95rem' }}>Securely link your AWS infrastructure with a single IAM role. No agents or sidecars required.</p>
                    </div>

                    <div className="feature-card">
                        <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>
                            <BarChart3 size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>2. Analyze</h3>
                        <p style={{ marginBottom: '1.5rem', flexGrow: 1, color: '#4b5563', lineHeight: 1.6, fontSize: '0.95rem' }}>Our engine scans for unused volumes, idle elastic IPs, and assets that can be deleted entirely.</p>
                    </div>

                    <div className="feature-card">
                        <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>
                            <SlidersHorizontal size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>3. Optimize</h3>
                        <p style={{ marginBottom: '1.5rem', flexGrow: 1, color: '#4b5563', lineHeight: 1.6, fontSize: '0.95rem' }}>Automated or 1-click manual policies permanently delete zombies to deliver instant cost savings.</p>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section id="features" className="features-section" style={{ paddingTop: '2rem' }}>
                <div className="features-label">THE REAPER ENGINE</div>
                <h2 className="features-title">Advanced Storage Optimization<br />For Modern Enterprise</h2>

                <div className="features-grid" style={{ marginTop: '3rem' }}>

                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <Trash2 size={24} />
                        </div>
                        <h3>Storage Reaper</h3>
                        <p>Automatically identifies and terminates unused volumes, unattached elastic IPs, and orphaned snapshots.</p>
                        <button className="feature-link" onClick={() => setActiveModal('reaper')}>
                            Learn More <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <TrendingUp size={24} />
                        </div>
                        <h3>Auto-Scaling</h3>
                        <p>Dynamic resource allocation based on real-time demand patterns, ensuring you never over-provision again.</p>
                        <button className="feature-link" onClick={() => setActiveModal('scaling')}>
                            Learn More <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <LineChart size={24} />
                        </div>
                        <h3>Cost Analytics</h3>
                        <p>Deep insights into your infrastructure with automated reports that highlight emerald-green efficiency gaps.</p>
                        <button className="feature-link" onClick={() => setActiveModal('analytics')}>
                            Learn More <ArrowRight size={16} />
                        </button>
                    </div>

                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="features-section" style={{ paddingTop: '6rem', paddingBottom: '6rem', background: '#fafafa', color: '#111827' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ maxWidth: '600px' }}>
                            <span style={{ display: 'inline-block', background: '#d1fae5', color: '#059669', padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
                                CRYSTALLINE EFFICIENCY
                            </span>
                            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '1rem', color: '#111827', lineHeight: 1.1 }}>
                                Simple, Transparent <br />Pricing
                            </h2>
                            <p style={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: 1.6 }}>
                                Choose the plan that fits your infrastructure needs. No hidden fees, just pure optimization for your cloud storage reaper engine.
                            </p>
                        </div>

                        {/* Pricing is monthly only */}
                    </div>

                    {/* Pricing Cards */}
                    <div className="features-grid" style={{ marginBottom: '6rem' }}>

                        {/* Starter */}
                        <div className="pricing-card" style={{ background: '#f8fafc', borderRadius: '24px', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Starter</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#111827' }}>$0</span>
                                <span style={{ color: '#4b5563', marginLeft: '0.25rem', fontWeight: 500 }}>/mo</span>
                            </div>
                            <p style={{ color: '#6b7280', marginBottom: '2.5rem', fontSize: '0.95rem' }}>5 credits monthly for zero-cost cloud optimization.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flexGrow: 1, marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    5 Free Scans / Month
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    Daily Reaper Scan
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    Community Support
                                </div>
                            </div>

                            <Link to="/signup" style={{ display: 'block', textAlign: 'center', padding: '1rem', background: '#a7f3d0', color: '#047857', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', transition: 'background 0.2s' }}>
                                Get Started
                            </Link>
                        </div>

                        {/* Solo */}
                        <div className="pricing-card" style={{ background: '#fff', borderRadius: '24px', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)' }}>
                            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#059669', color: '#fff', padding: '6px 18px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                                RECOMMENDED
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Solo</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#059669' }}>$19</span>
                                <span style={{ color: '#4b5563', marginLeft: '0.25rem', fontWeight: 500 }}>/mo</span>
                            </div>
                            <p style={{ color: '#6b7280', marginBottom: '2.5rem', fontSize: '0.95rem' }}>50 credits monthly for growing projects.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flexGrow: 1, marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    50 Scans / Month
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    Hourly Reaper Scan
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    Priority Email Support
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    Custom Policy Engine
                                </div>
                            </div>

                            <Link to="/signup" style={{ display: 'block', textAlign: 'center', padding: '1rem', background: '#059669', color: '#fff', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.25)' }}>
                                Buy Credits
                            </Link>
                        </div>

                        {/* Team */}
                        <div className="pricing-card" style={{ background: '#f8fafc', borderRadius: '24px', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Team</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#111827' }}>$199</span>
                                <span style={{ color: '#4b5563', marginLeft: '0.25rem', fontWeight: 500 }}>/mo</span>
                            </div>
                            <p style={{ color: '#6b7280', marginBottom: '2.5rem', fontSize: '0.95rem' }}>500 credits monthly for team collaboration.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flexGrow: 1, marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    500 Scans / Month
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    Real-time Reaper Events
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    Dedicated TAM
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', borderRadius: '50%', width: '22px', height: '22px' }}>
                                        <CheckCircle2 size={16} color="#059669" />
                                    </div>
                                    SLA Guarantees
                                </div>
                            </div>

                            <a href="/signup" style={{ display: 'block', textAlign: 'center', padding: '1rem', background: '#e5e7eb', color: '#374151', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', transition: 'background 0.2s' }}>
                                Buy Credits
                            </a>
                        </div>
                    </div>

                    {/* Detailed Comparison Table */}
                    <div style={{ paddingBottom: '2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', display: 'inline-block', position: 'relative' }}>
                                Detailed Comparison
                            </h3>
                            <div style={{ width: '40px', height: '4px', background: '#059669', borderRadius: '2px', margin: '0.5rem auto 0' }}></div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #d1d5db' }}>
                                        <th style={{ padding: '1.5rem 1rem', fontSize: '1rem', fontWeight: 700, color: '#111827', width: '40%' }}>Feature</th>
                                        <th style={{ padding: '1.5rem 1rem', fontSize: '1rem', fontWeight: 700, color: '#111827', width: '20%' }}>Starter</th>
                                        <th style={{ padding: '1.5rem 1rem', fontSize: '1rem', fontWeight: 700, color: '#059669', width: '20%' }}>Solo</th>
                                        <th style={{ padding: '1.5rem 1rem', fontSize: '1rem', fontWeight: 700, color: '#111827', width: '20%' }}>Team</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1.5rem 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 500 }}>Reaper engine frequency</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#4b5563', fontSize: '0.95rem' }}>Daily</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 600 }}>Hourly</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#4b5563', fontSize: '0.95rem' }}>Real-time</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1.5rem 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 500 }}>Number of cloud accounts</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#4b5563', fontSize: '0.95rem' }}>1 Account</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 600 }}>Up to 10</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#4b5563', fontSize: '0.95rem' }}>Unlimited</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1.5rem 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 500 }}>Support level</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#4b5563', fontSize: '0.95rem' }}>Docs Only</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 600 }}>Priority Email</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#4b5563', fontSize: '0.95rem' }}>24/7 Phone & TAM</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1.5rem 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 500 }}>Storage optimization alerts</td>
                                        <td style={{ padding: '1.5rem 1rem' }}><CheckCircle2 size={24} color="#059669" strokeWidth={1.5} /></td>
                                        <td style={{ padding: '1.5rem 1rem' }}><CheckCircle2 size={24} color="#059669" strokeWidth={1.5} /></td>
                                        <td style={{ padding: '1.5rem 1rem' }}><CheckCircle2 size={24} color="#059669" strokeWidth={1.5} /></td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1.5rem 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 500 }}>Custom tagging logic</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#9ca3af' }}>—</td>
                                        <td style={{ padding: '1.5rem 1rem' }}><CheckCircle2 size={24} color="#059669" strokeWidth={1.5} /></td>
                                        <td style={{ padding: '1.5rem 1rem' }}><CheckCircle2 size={24} color="#059669" strokeWidth={1.5} /></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '1.5rem 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 500 }}>Multi-region consolidation</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#9ca3af' }}>—</td>
                                        <td style={{ padding: '1.5rem 1rem', color: '#9ca3af' }}>—</td>
                                        <td style={{ padding: '1.5rem 1rem' }}><CheckCircle2 size={24} color="#059669" strokeWidth={1.5} /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-box">
                    <div className="cta-content">
                        <h2>Ready to stop burning our cloud budget?</h2>
                        <p>Join our platform to automate cloud storage cost reductions with Flux's automated reaper engine.</p>
                    </div>
                    <div className="cta-buttons">
                        <Link to="/signup" className="cta-btn-primary">Get Started Now</Link>
                        <a href="#sales" className="cta-btn-secondary">Talk to Sales</a>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="landing-footer">
                <div className="footer-grid">
                    <div>
                        <div className="footer-logo">
                            <Activity color="#10b981" size={20} />
                            Flux
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6 }}>
                            The next generation of cloud optimization for modern engineering teams.
                        </p>
                    </div>

                    <div>
                        <h4>Product</h4>
                        <ul>
                            <li><a href="#">Features</a></li>
                            <li><a href="#">Reaper Engine</a></li>
                            <li><a href="#">Security</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="/docs">Documentation</a></li>
                            <li><a href="#">API Reference</a></li>
                            <li><a href="#">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div>
                        © 2026 Flux Inc. All rights reserved.
                        <span style={{ marginLeft: '1rem', color: '#00d65b', fontWeight: 600 }}>
                            • Trusted by {userCount > 0 ? userCount : '10+'} registered users
                        </span>
                    </div>
                </div>
            </footer>

            {/* Modal Overlay */}
            {activeModal && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
                        <div className="feature-icon-box" style={{ marginBottom: '1rem' }}>
                            {activeModal === 'reaper' && <Trash2 size={24} />}
                            {activeModal === 'scaling' && <TrendingUp size={24} />}
                            {activeModal === 'analytics' && <LineChart size={24} />}
                        </div>
                        <h3 className="modal-title">{modalData[activeModal].title}</h3>
                        <ul className="modal-bullets">
                            {modalData[activeModal].bullets.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                            ))}
                        </ul>
                        <button className="landing-btn-primary" onClick={() => setActiveModal(null)} style={{ width: '100%', marginTop: '1rem' }}>
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
