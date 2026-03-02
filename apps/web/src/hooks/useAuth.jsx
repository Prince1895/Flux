import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

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
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
