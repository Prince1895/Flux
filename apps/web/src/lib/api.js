import axios from 'axios';
import { supabase } from './supabaseClient';

// Base API URL from Env or default to local 4000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Global Axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to attach the latest Supabase JWT token to every request
apiClient.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Service Wrapper
export const api = {
    // Accounts
    getAccounts: async () => {
        const res = await apiClient.get('/api/accounts');
        return res.data;
    },
    addAccount: async (payload) => {
        const res = await apiClient.post('/api/accounts', payload);
        return res.data;
    },

    // Scanners
    runScan: async (cloud_account_id) => {
        const res = await apiClient.post('/api/scans/run', { cloud_account_id });
        return res.data;
    },

    // Reaper Operations
    reapZombie: async (zombieId) => {
        const res = await apiClient.post(`/api/reap/${zombieId}`);
        return res.data;
    },
    getAllZombies: async () => {
        // This connects directly to Supabase from the frontend to fetch the user's zombies.
        // Ensure the RLS logic on zombie_resources is robust!
        const { data, error } = await supabase
            .from('zombie_resources')
            .select('*, cloud_accounts(account_alias)')
            .order('detected_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
