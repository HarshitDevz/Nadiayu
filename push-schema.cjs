const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:Harshhu%4016%40%23@db.dduietrrriojjfquticg.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase Database...");
    await client.connect();

    console.log("Dropping old tables if exist...");
    await client.query(`
      DROP TABLE IF EXISTS "user_profiles";
      DROP TABLE IF EXISTS "patients";
      DROP TABLE IF EXISTS "kyc_applications";
      DROP TABLE IF EXISTS "prescriptions";
    `);

    console.log("Reading schema files...");
    const schema1 = fs.readFileSync('schema_v2.sql', 'utf8');
    const schema2 = fs.readFileSync('schema_prescriptions.sql', 'utf8');

    console.log("Executing schema_v2.sql...");
    await client.query(schema1);
    
    console.log("Executing schema_prescriptions.sql...");
    await client.query(schema2);

    console.log("Disabling RLS...");
    await client.query(`
      ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
      ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
      ALTER TABLE kyc_applications DISABLE ROW LEVEL SECURITY;
      ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;
    `);

    console.log("✅ Successfully auto-pushed entire schema and disabled RLS!");

  } catch (err) {
    console.error("❌ DB Push Error:", err.message);
  } finally {
    await client.end();
  }
}

run();
