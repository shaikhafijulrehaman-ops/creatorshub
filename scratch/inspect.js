import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('./.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspect() {
  console.log('Testing Supabase connection...');
  const { data: users, error: usersErr } = await supabase.from('users').select('*').limit(1);
  if (usersErr) {
    console.error('Error querying "users" table:', usersErr);
  } else {
    console.log('"users" table exists! Row count sample:', users?.length);
    if (users && users.length > 0) {
      console.log('Sample user columns:', Object.keys(users[0]));
    }
  }

  const { data: profiles, error: profilesErr } = await supabase.from('profiles').select('*').limit(1);
  if (profilesErr) {
    console.error('Error querying "profiles" view:', profilesErr);
  } else {
    console.log('"profiles" view exists! Row count sample:', profiles?.length);
    if (profiles && profiles.length > 0) {
      console.log('Sample profile columns:', Object.keys(profiles[0]));
    }
  }
}

inspect();
