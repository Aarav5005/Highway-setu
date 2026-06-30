const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'highway_setu',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function main() {
  try {
    await pool.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('driver', 'dhaba_owner', 'mechanic', 'admin'));
      UPDATE users SET role = 'mechanic' WHERE role = 'mechanic_owner';
    `);
    console.log('Successfully updated the role check constraint to use "mechanic"');
  } catch (err) {
    console.error('Error updating constraint:', err);
  } finally {
    await pool.end();
  }
}

main();
