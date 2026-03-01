import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Play, Network, BarChart3, SlidersHorizontal, ArrowRight } from 'lucide-react';
import '../styles/landing.css';

const Home = () => {
    return (
        <div className="landing-page">

            {/* Navigation Bar */}
            <nav className="landing-nav">
                <Link to="/" className="logo-area">
                    <Activity color="var(--brand-green, #10b981)" size={24} />
                    GreenOps Reaper
                </Link>
                <div className="landing-nav-links">
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#enterprise">Enterprise</a>
                    <a href="#docs">Docs</a>
                </div>
                <div>
                    <Link to="/login" className="landing-btn-login">Login</Link>
                    <Link to="/login" className="landing-btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Activity size={14} /> NEW: REAPER ENGINE 2.0
                    </div>
                    <h1 className="hero-title">
                        Optimize Your <span className="text-brand">Cloud Spend</span> with Reaper
                    </h1>
                    <p className="hero-subtitle">
                        The enterprise-grade reaper engine that slashes AWS costs by up to 60% through intelligent lifecycle management and automated resource termination.
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
                            <path d="M6 14c-2.2 0-4-1.8-4-4s1.8-4 4-4c.4 0 .9.1 1.3.2A7.03 7.03 0 0 1 14 2c3.4 0 6.2 2.4 6.9 5.6C22.6 8 24 9.4 24 11.2c0 1.5-1.1 2.8-2.5 3.3V14c0 2.2-1.8 4-4 4H6z"></path>
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
            <section id="features" className="features-section">
                <div className="features-label">EFFICIENCY IN MOTION</div>
                <h2 className="features-title">Intelligent resource reclamation in three steps</h2>
                <p className="features-subtitle">
                    GreenOps Reaper connects to your cloud provider and automatically manages your infrastructure lifecycle without any manual intervention.
                </p>

                <div className="features-grid">

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Network size={32} />
                        </div>
                        <h3>1. Connect</h3>
                        <p>Securely link your AWS infrastructure with a single IAM role. No agents or sidecars required.</p>
                        <div className="placeholder-box"></div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <BarChart3 size={32} />
                        </div>
                        <h3>2. Analyze</h3>
                        <p>Our engine scans for unused volumes, idle elastic IPs, and assets that can be deleted entirely.</p>
                        <div className="placeholder-box"></div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <SlidersHorizontal size={32} />
                        </div>
                        <h3>3. Optimize</h3>
                        <p>Automated or 1-click manual policies permanently delete zombies to deliver instant cost savings.</p>
                        <div className="placeholder-box"></div>
                    </div>

                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-box">
                    <div className="cta-content">
                        <h2>Ready to reclaim your cloud budget?</h2>
                        <p>Start your free trial today and instantly identify wasted cloud spend with our automated reaper engine.</p>
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
                            GreenOps Reaper
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
                    <div>© 2026 GreenOps Reaper Inc. All rights reserved.</div>
                    <div className="footer-bottom-links">
                        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Home;
