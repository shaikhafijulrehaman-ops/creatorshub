import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envPath = './.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log('Testing connection to:', env.VITE_SUPABASE_URL);
  
  // Try selecting from profiles view
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(1);
  console.log('profiles view select:', { profiles, error: pErr });

  // Try selecting from users table
  const { data: users, error: uErr } = await supabase.from('users').select('*').limit(1);
  console.log('users table select:', { users, error: uErr });

  // Try select from connections table
  const { data: conns, error: cErr } = await supabase.from('connections').select('*').limit(1);
  console.log('connections table select:', { conns, error: cErr });
}

test();
