import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read env variables
const envContent = fs.readFileSync('./.env', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspect() {
  console.log('--- USERS ---');
  const { data: users, error: usersErr } = await supabase.from('users').select('id, email, role, full_name, created_at');
  if (usersErr) console.error('Error fetching users:', usersErr);
  else console.log(users);

  console.log('--- PROJECTS ---');
  const { data: projects, error: projErr } = await supabase.from('projects').select('id, title, business_id, created_at');
  if (projErr) console.error('Error fetching projects:', projErr);
  else console.log(projects);

  console.log('--- NOTIFICATIONS ---');
  const { data: notifications, error: notifErr } = await supabase.from('notifications').select('id, title, user_id, created_at');
  if (notifErr) console.error('Error fetching notifications:', notifErr);
  else console.log(notifications);
}

inspect();
