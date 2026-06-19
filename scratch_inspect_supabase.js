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
console.log('supabase keys:', Object.keys(supabase));
if (supabase.rest) {
  console.log('supabase.rest exists!');
  console.log('supabase.rest.headers:', supabase.rest.headers);
} else {
  console.log('supabase.rest does not exist');
}
