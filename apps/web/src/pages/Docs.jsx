import { CheckCircle2, Copy, Search, ThumbsUp, ThumbsDown, ArrowRight, Zap, Target, BookOpen, Layers, RefreshCw, Cpu, HelpCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/docs.css';

const Docs = () => {
    return (
        <div className="docs-layout">

            {/* Left Sidebar */}
            <aside className="docs-sidebar-left">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div className="docs-brand">
                        <div className="docs-brand-icon">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <div className="docs-brand-text">
                            <h1>Flux</h1>
                            <span>V2.4.0-EMERALD</span>
                        </div>
                    </div>
                </Link>

                <div className="docs-nav-group">
                    <div className="docs-nav-label">Essentials</div>
                    <Link to="/docs" className="docs-nav-link active">
                        <BookOpen size={18} /> Introduction
                    </Link>
                    <Link to="/docs" className="docs-nav-link">
                        <Cpu size={18} /> Architecture
                    </Link>
                    <Link to="/docs" className="docs-nav-link">
                        <Target size={18} /> Storage Reaper
                    </Link>
                </div>

                <div className="docs-nav-group">
                    <div className="docs-nav-label">Enterprise</div>
                    <Link to="/docs" className="docs-nav-link">
                        Cloud Integration
                    </Link>
                    <Link to="/docs" className="docs-nav-link">
                        Security
                    </Link>
                    <Link to="/docs" className="docs-nav-link">
                        Billing
                    </Link>
                </div>

                <div className="docs-sidebar-footer">
                    <div className="docs-dev-portal-pill">DEVELOPER PORTAL</div>
                    <Link to="/docs" className="docs-footer-link">
                        <HelpCircle size={16} /> Support
                    </Link>
                    <Link to="/docs" className="docs-footer-link">
                        <Users size={16} /> Community
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="docs-main-wrapper">
                <div className="docs-main">

                    <div className="docs-breadcrumbs">
                        DOCUMENTATION <span>&gt;&gt;</span> <span className="active">INTRODUCTION</span>
                    </div>
                    <div className="docs-hero">
                        <h1>Setup the <span style={{ color: '#00d65b' }}>Flux Account</span></h1>
                        <p>
                            Flux is a next-generation storage orchestration engine designed for high-density cloud environments.
                            The Reaper Engine is the core component responsible for automated lifecycle management and crystalline data efficiency.
                        </p>
                    </div>

                    <div className="docs-info-cards">
                        <div className="docs-info-card docs-card-light">
                            <h3>Lightning Fast</h3>
                            <p>Setup takes less than 3 minutes with our easy to use dashboard tools.</p>
                        </div>
                        <div className="docs-info-card docs-card-green">
                            <h3>Enterprise Ready</h3>
                            <p>SOC2 compliant storage reaper logic with zero-trust architecture.</p>
                        </div>
                    </div>

                    <div className="docs-section" id="prerequisites">
                        <h2>1. Prerequisites</h2>
                        <p style={{ fontSize: '0.95rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                            Before initializing the Flux Reaper, ensure your environment meets the minimum Crystalline requirements:
                        </p>
                        <ul className="docs-list">
                            <li><CheckCircle2 size={18} className="docs-list-icon" /> An active Flux Account</li>
                            <li><CheckCircle2 size={18} className="docs-list-icon" /> Access to your AWS Management Console</li>
                        </ul>

                        <div className="docs-expert-tip">
                            <LightbulbIcon className="docs-expert-tip-icon" size={20} />
                            <div>
                                <h4>EXPERT TIP</h4>
                                <p>Use the Cloud Accounts page to quickly link multiple accounts for cross-regional scanning.</p>
                            </div>
                        </div>
                    </div>

                    <div className="docs-section" id="installation">
                        <h2>2. IAM Trust Configuration</h2>
                        <p style={{ fontSize: '0.95rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                            Flux uses secure Cross-Account IAM Roles instead of hardcoded API keys. Set this up using the JSON policy below in your AWS console:
                        </p>
                        <div className="docs-code-block">
                            <div className="docs-code-comment"># Paste this into your IAM Role Trust Relationship</div>
                            <div>{`{`}</div>
                            <div>{`  "Version": "2012-10-17",`}</div>
                            <div>{`  "Statement": [`}</div>
                            <div>{`    {`}</div>
                            <div>{`      "Effect": `}<span style={{ color: '#fbbf24' }}>"Allow"</span>,</div>
                            <div>{`      "Principal": { `}<span style={{ color: '#fbbf24' }}>"AWS"</span>: <span className="docs-code-command">"arn:aws:iam::YOUR_SaaS_ACCOUNT:root"</span> {`},`}</div>
                            <div>{`      "Action": `}<span style={{ color: '#fbbf24' }}>"sts:AssumeRole"</span></div>
                            <div>{`    }`}</div>
                            <div>{`  ]`}</div>
                            <div>{`}`}</div>
                        </div>
                    </div>

                    <div className="docs-section" id="configuration">
                        <h2>3. Engine Configuration</h2>
                        <p style={{ fontSize: '0.95rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                            The core of Flux's power lies in the Dashboard engine. Define your retention policies here to maximize efficiency.
                        </p>

                        <div className="docs-setup-cards">
                            <div className="docs-setup-card">
                                <div className="docs-setup-icon">
                                    <RefreshCw size={20} />
                                </div>
                                <h3>Auto-Reap</h3>
                                <p>Automatically identifies and purges orphaned shards across multi-region clusters every 24 hours.</p>
                            </div>
                            <div className="docs-setup-card">
                                <div className="docs-setup-icon">
                                    <Layers size={20} />
                                </div>
                                <h3>Cloud Integration</h3>
                                <p>Compression logic that prioritizes cold storage for archival data while keeping hot data at edge.</p>
                            </div>
                        </div>
                    </div>

                    <div className="docs-divider"></div>

                    <div className="docs-feedback">
                        <div className="docs-feedback-text">
                            <h4>Was this guide helpful?</h4>
                            <span>LAST UPDATED APR 01, 2026</span>
                        </div>
                        <div className="docs-feedback-btns">
                            <button className="docs-btn-outline"><ThumbsUp size={16} /> Yes</button>
                            <button className="docs-btn-outline"><ThumbsDown size={16} /> No</button>
                        </div>
                    </div>

                    <div className="docs-footer">
                        <a href="#">© 2026 FLUX CLOUD ENGINE. CRYSTALLINE EFFICIENCY.</a>
                        <a href="#">PRIVACY POLICY</a>
                        <a href="#">TERMS OF SERVICE</a>
                    </div>

                </div>
            </main>

            {/* Right Sidebar */}
            <aside className="docs-sidebar-right">
                <div className="docs-toc-title">ON THIS PAGE</div>
                <ul className="docs-toc-list">
                    <li className="active">1. Prerequisites</li>
                    <li>2. IAM Configuration</li>
                    <li>3. Engine Configuration</li>
                    <li>4. Troubleshooting</li>
                </ul>

                <div className="docs-support-card">
                    <h4>Need help?</h4>
                    <p>Our engineering team is available for enterprise support 24/7.</p>
                    <a href="#">CONTACT SUPPORT <ArrowRight size={14} /></a>
                </div>
            </aside>

        </div>
    );
};

/* Auxiliary Lightbulb Icon Component */
const LightbulbIcon = ({ className, size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M15 14c.2-.5.5-1.1.9-1.6 1.4-1.8 1.4-4.5 0-6.4a5.04 5.04 0 0 0-7.8 0 5.17 5.17 0 0 0 0 6.4c.4.5.7 1.1.9 1.6"></path>
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
    </svg>
);

export default Docs;
