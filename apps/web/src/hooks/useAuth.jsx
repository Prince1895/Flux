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

<<<<<<< HEAD
    const handleSession = async (currentSession) => {
        let currentUser = currentSession?.user ?? null;

        // If logged in but no tenant_id, sync the profile with backend
        if (currentUser && !currentUser.user_metadata?.tenant_id) {
            try {
                // Call the backend to create tenant and sync to public.users
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/sync`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${currentSession.access_token}` }
                });
                if (res.ok) {
                    // Refresh session to grab the new user_metadata containing tenant_id
                    const { data } = await supabase.auth.refreshSession();
                    currentUser = data.session?.user ?? currentUser;
                    currentSession = data.session ?? currentSession;
                }
            } catch (err) {
                console.error("Failed to sync profile:", err);
            }
        }

        setSession(currentSession);
        setUser(currentUser);
        setLoading(false);
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => subscription.unsubscribe();
=======
    // Restore session from localStorage on mount
    useEffect(() => {
        const storedUser = getStoredUser();
        const storedToken = getStoredToken();
        if (storedUser && storedToken) {
            setUser(storedUser);
        }
        setLoading(false);
>>>>>>> fix-branch
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
