import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envPath = './.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

async function run() {
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  
  // Fetch users to get a test user ID
  const { data: users, error: uErr } = await supabase.from('users').select('id').limit(1);
  if (uErr || !users || users.length === 0) {
    console.log('DIAGNOSTIC_RESULT: FAILED_TO_FETCH_USERS', uErr);
    process.exit(1);
  }
  
  const userId = users[0].id;
  console.log('Testing connection with user ID:', userId);

  // Set the x-user-id header to simulate authentication
  const authenticatedClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { 'x-user-id': userId } }
  });

  // Query conversation_members table
  console.log('Querying conversation_members...');
  const { data, error } = await authenticatedClient
    .from('conversation_members')
    .select('*')
    .limit(1);

  if (error) {
    console.log('DIAGNOSTIC_RESULT: RECURSION_ACTIVE_OR_ERROR', error.message);
  } else {
    console.log('DIAGNOSTIC_RESULT: SUCCESS_RLS_WORKING_NO_RECURSION');
  }
  process.exit(0);
}

run();
