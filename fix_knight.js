import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function run() {
  await supabase
    .from('kyc_applications')
    .update({ email: 'knight.harshu@gmail.com' })
    .eq('id', 'kyc-2026-4222');
  console.log('Fixed knight kyc');
}
run();
