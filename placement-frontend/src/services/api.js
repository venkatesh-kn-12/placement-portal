import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Intercept requests and add the Supabase or local auth token safely
api.interceptors.request.use(async (config) => {
  try {
    const sessionPromise = supabase.auth.getSession();
    // Add a fast timeout for getSession so network resolution failures do not hang requests
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ data: { session: null } }), 1000));
    const result = await Promise.race([sessionPromise, timeoutPromise]);
    
    if (result?.data?.session?.access_token) {
      config.headers.Authorization = `Bearer ${result.data.session.access_token}`;
    } else {
      const localToken = localStorage.getItem('token');
      if (localToken) {
        config.headers.Authorization = `Bearer ${localToken}`;
      }
    }
  } catch (err) {
    // If Supabase connection fails (e.g. ERR_NAME_NOT_RESOLVED), fallback silently to local token if present
    const localToken = localStorage.getItem('token');
    if (localToken) {
      config.headers.Authorization = `Bearer ${localToken}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export default api;
