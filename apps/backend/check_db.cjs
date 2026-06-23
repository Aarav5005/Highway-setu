const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  const tablesToCheck = ['users', 'driver_profiles', 'dhaba_profiles', 'mechanic_profiles', 'reviews', 'documents'];
  for (const table of tablesToCheck) {
    const res = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`, [table]);
    console.log(`Table ${table}: ${res.rows[0].exists}`);
  }

  const columnsToCheck = ['fcm_token', 'language_pref', 'role'];
  for (const col of columnsToCheck) {
    const res = await client.query(`SELECT data_type, udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = $1`, [col]);
    if (res.rows.length > 0) {
      console.log(`Column users.${col}: EXISTS (${res.rows[0].data_type} / ${res.rows[0].udt_name})`);
    } else {
      console.log(`Column users.${col}: DOES NOT EXIST`);
    }
  }

  await client.end();
}

run().catch(console.error);
