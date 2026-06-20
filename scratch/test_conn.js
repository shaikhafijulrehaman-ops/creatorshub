import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read env from the workspace .env file
const envPath = './.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log('Fetching users to find two valid test IDs...');
  const { data: users, error: uErr } = await supabase.from('users').select('id, full_name, email');
  if (uErr) {
    console.error('Error fetching users:', uErr);
    return;
  }
  
  if (!users || users.length < 2) {
    console.log('Not enough users in database to test connections:', users);
    return;
  }

  const user1 = users[0];
  const user2 = users[1];
  console.log(`Attempting connection request from ${user1.full_name} (${user1.id}) to ${user2.full_name} (${user2.id})`);

  // We set the x-user-id header to simulate user1 initiating the request
  const customSupabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        'x-user-id': user1.id
      }
    }
  });

  const reqId = `test-req-${Date.now()}`;
  const { error: insErr } = await customSupabase.from('connection_requests').insert([{
    id: reqId,
    sender_id: user1.id,
    receiver_id: user2.id,
    status: 'Pending'
  }]);

  if (insErr) {
    console.error('Insert failed:', insErr);
  } else {
    console.log('Insert succeeded! Cleaning up...');
    const { error: delErr } = await customSupabase.from('connection_requests').delete().eq('id', reqId);
    if (delErr) console.error('Delete cleanup failed:', delErr);
    else console.log('Cleanup successful!');
  }
}

test();
