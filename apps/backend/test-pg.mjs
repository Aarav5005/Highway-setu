import { Pool } from 'pg';

async function test(port, password) {
  const config = { host: 'localhost', port, user: 'postgres', database: 'postgres', connectionTimeoutMillis: 2000 };
  if (password !== undefined) {
    config.password = password;
  }
  const pool = new Pool(config);
  try {
    await pool.connect();
    console.log(`Connected successfully on port ${port} with password '${password}'`);
    process.exit(0);
  } catch (e) {
    console.log(`Failed on port ${port} with password '${password}': ${e.message}`);
  }
}

async function run() {
  await test(5432, undefined); // Try without password
  await test(5432, 'postgres');
  await test(5432, 'root');
  await test(5432, 'admin');
  console.log('All failed');
  process.exit(1);
}

run();
