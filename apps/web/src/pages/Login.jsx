import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, Mail, Lock, Github } from 'lucide-react';
import { apiClient } from '../lib/api';
import GlobeCanvas from '../components/GlobeCanvas';
import '../styles/landing.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);



const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to authenticate');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: '"Inter", sans-serif' }}>
            {/* Left Side: Form */}
            <div style={{ flex: '0 0 700px', width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRight: '1px solid #f3f4f6', zIndex: 10 }}>
                <div style={{ padding: '3rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.25rem', color: '#111827', marginBottom: 'auto', textDecoration: 'none' }}>
                        <Activity color="var(--brand-green, #10b981)" size={24} />
                        Flux
                    </Link>

                    {/* Form Container */}
                    <div style={{ margin: 'auto 0', maxWidth: '380px', width: '100%', alignSelf: 'center' }}>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Welcome back</h1>
                        <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2.5rem' }}>
                            Please enter your details to sign in to your optimization dashboard.
                        </p>

                        {/* OAuth Login Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button
                                onClick={() => window.location.href = `${API_BASE_URL}/api/auth/google`}
                                style={{ flex: 1, padding: '0.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#374151', transition: 'background 0.2s' }}>
                                <GoogleIcon /> Google
                            </button>
                            <button
                                onClick={() => window.location.href = `${API_BASE_URL}/api/auth/github`}
                                style={{ flex: 1, padding: '0.75rem', background: '#111827', border: '1px solid #111827', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#fff', transition: 'background 0.2s' }}>
                                <Github size={18} /> GitHub
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#9ca3af' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                            <span style={{ padding: '0 1rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>or sign in with email</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                        </div>

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {error && (
                                <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>
                                    {error}
                                </div>
                            )}

                            {/* Email Input */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Email address</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flux-input"
                                        placeholder="admin@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>Password</label>
                                    <a href="#" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#00d65b', textDecoration: 'none' }}>Forgot password?</a>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flux-input"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.9rem', backgroundColor: '#00d65b', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(0, 214, 91, 0.2)' }}>
                                {loading ? 'Signing in...' : 'Sign in to Flux'}
                            </button>
                        </form>



                        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                            Not a member yet? <Link to="/signup" style={{ color: '#00d65b', fontWeight: 600, textDecoration: 'none' }}>Join a Starter Plan</Link>
                        </div>

                    </div>

                    <div style={{ marginTop: 'auto' }}></div>
                </div>
            </div>

            {/* Right Side: Original background + transparent globe overlay */}
            <div className="login-visual" style={{
                flex: 1,
                backgroundColor: '#030805',
                backgroundImage: 'radial-gradient(circle at 0% 50%, rgba(0, 214, 91, 0.12) 0%, #030805 70%)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '5rem',
                color: '#fff',
                overflow: 'hidden',
            }}>
                {/* Original wavy lines background */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.8, zIndex: 0 }}>
                    <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                        <path d="M-100,500 C150,300 350,600 1100,400 L1100,1100 L-100,1100 Z" fill="rgba(0, 214, 91, 0.03)" />
                        <path d="M-100,550 C150,350 350,650 1100,450" fill="none" stroke="rgba(0, 214, 91, 0.2)" strokeWidth="1" />
                        <path d="M-100,600 C150,400 350,700 1100,500" fill="none" stroke="rgba(0, 214, 91, 0.15)" strokeWidth="2" />
                        <path d="M-100,650 C150,450 350,750 1100,550" fill="none" stroke="rgba(0, 214, 91, 0.1)" strokeWidth="4" />
                        <path d="M-100,700 C150,500 350,800 1100,600" fill="none" stroke="rgba(0, 214, 91, 0.05)" strokeWidth="8" />
                    </svg>
                </div>

                {/* Globe — centered transparent overlay */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    opacity: 0.85,
                }}>
                    <GlobeCanvas size={1200} speed={0.7} />
                </div>

                {/* Badge — bottom left, above globe */}
                <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 214, 91, 0.1)', border: '1px solid rgba(0, 214, 91, 0.2)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: '#00d65b', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00d65b', boxShadow: '0 0 8px #00d65b' }}></div>
                        SYSTEM OPERATIONAL
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
