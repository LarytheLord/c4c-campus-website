import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use cookies for auth storage so server-side middleware can access the session
    storage: typeof window !== 'undefined' ? {
      getItem: (key: string) => {
        // Try localStorage first, then cookies
        const localValue = localStorage.getItem(key);
        if (localValue) return localValue;

        const cookies = document.cookie.split(';');
        const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
      },
      setItem: (key: string, value: string) => {
        // Store in both localStorage and cookies
        localStorage.setItem(key, value);
        // Set cookie with secure attributes for production
        const isSecure = window.location.protocol === 'https:';
        const cookieValue = encodeURIComponent(value);
        document.cookie = `${key}=${cookieValue}; path=/; max-age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    } : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
