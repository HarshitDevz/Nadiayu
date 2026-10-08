import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function run() {
  const { data: userProfiles } = await supabase.from('user_profiles').select('*');
  const harshitProfile = userProfiles?.find(p => p.email === 'harshit.harsh1982@gmail.com');

  if (harshitProfile) {
     console.log('Found profile, updating KYC...');
     const { data, error } = await supabase
       .from('kyc_applications')
       .update({ email: harshitProfile.email })
       .eq('id', 'kyc-2026-1201'); // ID we saw earlier

     console.log('Update result:', error ? error : 'Success');
  } else {
     console.log('Profile not found.');
  }
}
run();
