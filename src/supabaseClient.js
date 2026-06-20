import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

// Helper to create client instance
const createSupabaseInstance = (userId = null) => {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    try {
      const options = {
        global: {
          headers: userId ? { 'x-user-id': userId } : {}
        }
      };
      return createClient(supabaseUrl, supabaseAnonKey, options);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }
  
  // Return dummy client if environment variables are missing
  return {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: { message: 'Supabase client not configured' } }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase client not configured' } }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: { message: 'Supabase client not configured' } })
      }),
      delete: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: null, error: { message: 'Supabase client not configured' } })
        })
      })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      signInWithOAuth: () => Promise.reject(new Error('Supabase client not configured')),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  };
};

// Initialize initial instance
// Check if cached user session exists to pre-set user header on load
const getInitialUserId = () => {
  try {
    const cached = localStorage.getItem('ch_current_user');
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed?.id || null;
    }
  } catch (e) {
    console.error('Error reading cached user for initial supabase client setup:', e);
  }
  return null;
};

supabaseInstance = createSupabaseInstance(getInitialUserId());

// Export as a Proxy so that all imports dynamically get the latest instance
export const supabase = new Proxy({}, {
  get(target, prop) {
    return supabaseInstance[prop];
  },
  set(target, prop, value) {
    supabaseInstance[prop] = value;
    return true;
  }
});

export const setSupabaseUserHeader = (userId) => {
  if (supabaseInstance) {
    // Gracefully disconnect old realtime socket if it exists
    if (supabaseInstance.realtime && typeof supabaseInstance.realtime.disconnect === 'function') {
      try {
        supabaseInstance.realtime.disconnect();
      } catch (e) {
        console.warn('Failed to disconnect old realtime instance:', e);
      }
    }
  }

  // Re-create the client with the new x-user-id in global headers
  console.log('Re-creating Supabase client with user ID:', userId);
  supabaseInstance = createSupabaseInstance(userId);
};
