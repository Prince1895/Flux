import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, Mail, Lock, User, Github, Shield, Rocket } from 'lucide-react';
import '../styles/landing.css';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);



const Signup = () => {
    // We would use useAuth's signup method if it were defined, but for now we'll simulate.
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Provide a simulated path / error if signup backend isn't ready
        setTimeout(() => {
            setLoading(false);
            navigate('/login');
        }, 1000);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: '"Inter", sans-serif', padding: '1rem', display: 'flex', flexDirection: 'column' }}>

            {/* Top Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 3rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.25rem', color: '#111827', textDecoration: 'none' }}>
                    <Activity color="var(--brand-green, #10b981)" size={24} />
                    Flux
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <a href="#" style={{ color: '#4b5563', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none' }}>Contact Sales</a>
                    <Link to="/login" style={{ backgroundColor: '#111827', color: '#ffffff', padding: '0.6rem 1.4rem', borderRadius: '40px', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', transition: 'opacity 0.2s' }}>
                        Log in
                    </Link>
                </div>
            </div>

            {/* Main Content Split */}
            <div style={{ display: 'flex', flex: 1, maxWidth: '1400px', margin: '0 auto 2rem', width: '100%', gap: '4rem', alignItems: 'center', justifyContent: 'center' }}>

                {/* Left Side: Form */}
                <div style={{ flex: '1', maxWidth: '500px', padding: '2rem 3rem' }}>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#e0f2e9', color: '#00d65b', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00d65b' }}></div>
                        FREE 14-DAY TRIAL
                    </div>

                    <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                        Start optimizing<br />with <span style={{ color: '#00d65b' }}>Flux</span>
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '2.5rem', maxWidth: '400px' }}>
                        Create your account and regain control of your cloud storage costs today.
                    </p>

                    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {error && (
                            <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>
                                {error}
                            </div>
                        )}

                        {/* Name Input */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="flux-input"
                                    placeholder="e.g. Jane Doe"
                                    style={{ backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flux-input"
                                    placeholder="name@company.com"
                                    style={{ backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flux-input"
                                    placeholder="Min. 8 characters"
                                    style={{ backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '1.1rem', backgroundColor: '#00d65b', color: '#ffffff', border: 'none', borderRadius: '40px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem', transition: 'background 0.2s', boxShadow: '0 4px 14px rgba(0, 214, 91, 0.2)' }}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>
                        By clicking "Create Account", you agree to our <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>Terms of Service</a> and <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>Privacy Policy</a>.
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                        <span style={{ padding: '0 1rem', fontSize: '0.85rem', color: '#6b7280' }}>Or continue with</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="auth-social-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0.8rem', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderRadius: '40px', fontSize: '0.9rem', fontWeight: 600, color: '#374151', cursor: 'pointer', transition: 'background 0.2s' }}>
                            <GoogleIcon /> Google
                        </button>
                        <button className="auth-social-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0.8rem', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderRadius: '40px', fontSize: '0.9rem', fontWeight: 600, color: '#374151', cursor: 'pointer', transition: 'background 0.2s' }}>
                            <Github size={18} color="#111827" /> GitHub
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem', color: '#4b5563' }}>
                        Already have an account? <Link to="/login" style={{ color: '#111827', fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
                    </div>
                </div>

                {/* Right Side: Graphic Panel */}
                <div className="login-visual" style={{ flex: '1', maxWidth: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '24px', overflow: 'hidden', backgroundImage: 'url(/cloud-3d.png)', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>

                        {/* Status Badges Overlay */}
                        <div style={{ position: 'absolute', top: '15%', right: '+5%', background: '#dcfce7', padding: '0.8rem 1.2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', animation: 'float 5s ease-in-out infinite' }}>
                            <div style={{ background: '#bbf7d0', padding: '0.5rem', borderRadius: '50%', color: '#16a34a' }}>
                                <Rocket size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Speed Boost</div>
                                <div style={{ fontSize: '0.95rem', color: '#111827', fontWeight: 800 }}>Optimized</div>
                            </div>
                        </div>

                        <div style={{ position: 'absolute', bottom: '15%', left: '5%', background: '#dcfce7', padding: '0.8rem 1.2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}>
                            <div style={{ background: '#bbf7d0', padding: '0.5rem', borderRadius: '50%', color: '#16a34a' }}>
                                <Shield size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Status</div>
                                <div style={{ fontSize: '0.95rem', color: '#111827', fontWeight: 800 }}>Encrypted & Safe</div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Signup;
