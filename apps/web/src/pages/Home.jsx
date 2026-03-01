import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Play, ArrowRight, Trash2, TrendingUp, LineChart, X, Network, BarChart3, SlidersHorizontal } from 'lucide-react';
import '../styles/landing.css';

const Home = () => {
    const [activeModal, setActiveModal] = useState(null);

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
                    <a href="#enterprise">Enterprise</a>
                    <a href="#docs">Docs</a>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Link to="/login" className="landing-btn-login">Login</Link>
                    <Link to="/login" className="landing-btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Activity size={12} /> NEW: REAPER ENGINE 1.0
                    </div>
                    <h1 className="hero-title">
                        Optimize Your <br /><span className="text-brand">Cloud Storage</span><br /> with Flux
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

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-box">
                    <div className="cta-content">
                        <h2>Ready to stop burning our cloud budget?</h2>
                        <p>Join our platform to automate cloud storage cost reductions with Flux's automated reaper engine.</p>
                    </div>
                    <div className="cta-buttons">
                        <Link to="/login" className="cta-btn-primary">Get Started Now</Link>
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
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">API Reference</a></li>
                            <li><a href="#">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Newsletter</h4>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Get the latest on cloud optimization.</p>
                        <div className="newsletter-input">
                            <input type="email" placeholder="Email" />
                            <button><ArrowRight size={16} /></button>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div>© 2026 Flux Inc. All rights reserved.</div>
                    <div className="footer-bottom-links">
                        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
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
