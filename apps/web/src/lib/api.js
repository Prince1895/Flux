import axios from 'axios';
import { getStoredToken } from '../hooks/useAuth';

// Base API URL from Env or default to local 4000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Global Axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor: attach JWT from localStorage to every request
apiClient.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
    deleteAccount: async (accountId) => {
        const res = await apiClient.delete(`/api/accounts/${accountId}`);
        return res.data;
    },

    // Scanners
    runScan: async (cloud_account_id) => {
        const res = await apiClient.post('/api/scans/run', { cloud_account_id });
        return res.data;
    },

    // Zombie Resources
    getAllZombies: async () => {
        const res = await apiClient.get('/api/zombies');
        return res.data;
    },

    // Reaper Operations
    reapZombie: async (zombieId) => {
        const res = await apiClient.post(`/api/reap/${zombieId}`);
        return res.data;
    },
};
