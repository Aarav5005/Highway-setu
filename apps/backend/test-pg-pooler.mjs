import { Pool } from 'pg';

async function run() {
  const pool = new Pool({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres',
    password: 'Panchal55#',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await pool.connect();
    console.log(`Success`);
  } catch (e) {
    console.log(`Failed: ${e.message}`);
  } finally {
    await pool.end();
  }
}
run();
