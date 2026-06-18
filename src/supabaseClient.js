import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance;

// Fail-safe initialization to prevent crashing on Vercel/Netlify if environment variables are missing
if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

if (!supabaseInstance) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing, invalid, or empty. ' +
    'The app will automatically run in demo/fallback mode using local mock data.'
  );

  // Return a dummy proxy client that returns graceful errors instead of throwing runtime exceptions
  supabaseInstance = {
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
}

export const supabase = supabaseInstance;
