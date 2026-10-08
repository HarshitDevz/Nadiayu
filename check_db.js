import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function run() {
  const { data: p1 } = await supabase.from('user_profiles').select('*');
  console.log('USER_PROFILES:');
  p1?.forEach(p => console.log(p.id, p.googleUserId, p.email, p.aadhaarHash));

  const { data: p2 } = await supabase.from('patients').select('*');
  console.log('PATIENTS:');
  p2?.forEach(p => console.log(p.id, p.uhid, p.name));
}
run();
