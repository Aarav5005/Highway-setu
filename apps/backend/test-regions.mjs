import { Pool } from 'pg';

const regions = ['ap-south-1', 'us-east-1', 'eu-west-1', 'ap-southeast-1', 'us-west-1', 'us-east-2', 'eu-central-1', 'ap-northeast-1'];
const password = 'Panchal55#';
const user = 'postgres.qjqodkloncrejbnapuly';

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const pool = new Pool({
    host,
    port: 5432,
    database: 'postgres',
    user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await pool.connect();
    console.log(`Success on ${host}`);
    return host;
  } catch (e) {
    console.log(`Failed on ${host}: ${e.message}`);
    return null;
  } finally {
    await pool.end();
  }
}

async function run() {
  for (const r of regions) {
    const res = await testRegion(r);
    if (res) {
      console.log('FOUND:', res);
      process.exit(0);
    }
  }
  process.exit(1);
}

run();
