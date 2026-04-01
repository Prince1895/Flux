import { useState, useEffect, createContext, useContext } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AuthContext = createContext();

// ── Helpers ───────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

const getStoredUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');

        if (urlToken) {
            try {
                // Decode JWT Payload
                const payload = JSON.parse(atob(urlToken.split('.')[1]));
                const oauthUser = {
                    id: payload.id,
                    email: payload.email,
                    tenant_id: payload.tenant_id,
                    role: payload.role,
                    company_name: payload.company_name
                };
                saveSession(urlToken, oauthUser);
                setUser(oauthUser);
                // Clean the token from the URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (err) {
                console.error('Failed to parse OAuth token:', err);
            }
        } else {
            const storedUser = getStoredUser();
            const storedToken = getStoredToken();
            if (storedUser && storedToken) {
                setUser(storedUser);
            }
        }
        setLoading(false);
    }, []);

    const signup = async (email, password, name) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, company_name: name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');

        saveSession(data.token, data.user);
        setUser(data.user);
        return data;
    };

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        saveSession(data.token, data.user);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        clearSession();
        setUser(null);
    };

    // session shape expected by existing components
    const session = user ? { access_token: getStoredToken(), user } : null;

    return (
        <AuthContext.Provider value={{ user, session, loading, signup, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
