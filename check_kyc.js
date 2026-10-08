import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function run() {
  const { data: kyc } = await supabase.from('kyc_applications').select('*');
  console.log('KYC_APPLICATIONS:');
  kyc?.forEach(k => console.log(k.id, k.globalId, k.allocatedPatientId));
}
run();
