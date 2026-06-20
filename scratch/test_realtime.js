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
  console.log('Fetching users...');
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const { data: users } = await supabase.from('users').select('id, full_name');
  if (!users || users.length < 2) {
    console.log('Need at least 2 users.');
    return;
  }
  const u1 = users[0];
  const u2 = users[1];
  console.log(`User 1: ${u1.full_name} (${u1.id}), User 2: ${u2.full_name} (${u2.id})`);

  // Subscribed client representing User 2
  const client2 = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { 'x-user-id': u2.id } }
  });

  const sub = client2
    .channel('messages-test')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
      console.log('Realtime Event Received by Client 2:', payload.eventType, payload.new);
    })
    .subscribe((status) => {
      console.log('Client 2 subscription status:', status);
    });

  // Client 1 inserts a message
  const client1 = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { 'x-user-id': u1.id } }
  });

  // Let's find or create a conversation between u1 and u2
  console.log('Ensuring conversation exists...');
  const convId = `test-conv-${Date.now()}`;
  
  // Insert conversation & members as postgres/anon (since we have check(true))
  await client1.from('conversations').insert([{ id: convId }]);
  await client1.from('conversation_members').insert([
    { id: `test-mem1-${Date.now()}`, conversation_id: convId, user_id: u1.id },
    { id: `test-mem2-${Date.now()}`, conversation_id: convId, user_id: u2.id }
  ]);

  console.log('Waiting 3 seconds for subscription to settle...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('Client 1 inserting message...');
  const { data, error } = await client1.from('messages').insert([{
    id: `test-msg-${Date.now()}`,
    conversation_id: convId,
    sender_id: u1.id,
    message: 'Hello from test script!'
  }]);
  if (error) {
    console.error('Insert message error:', error);
  } else {
    console.log('Message inserted successfully.');
  }

  console.log('Waiting 5 seconds for realtime event...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Cleanup
  console.log('Cleaning up...');
  await client1.from('conversations').delete().eq('id', convId);
  client2.removeChannel(sub);
  console.log('Done!');
  process.exit(0);
}

run();
