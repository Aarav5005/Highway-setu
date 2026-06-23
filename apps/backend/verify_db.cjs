require('dotenv').config();
const { Client } = require('pg');

async function verify() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD.replace(/"/g, ''),
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tables = tablesRes.rows.map(row => row.table_name);
    console.log('Tables found:', tables.join(', '));
    
    const requiredTables = ['users', 'driver_profiles', 'dhaba_profiles', 'mechanic_profiles', 'reviews', 'documents'];
    const missingTables = requiredTables.filter(t => !tables.includes(t));
    if (missingTables.length > 0) {
      console.error('Missing tables:', missingTables);
    } else {
      console.log('All required tables exist.');
    }

    // Check columns
    const colsRes = await client.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    const columns = colsRes.rows.map(row => row.column_name);
    console.log('Columns in users:', columns.join(', '));

    const requiredColumns = ['fcm_token', 'language_pref', 'role'];
    const missingColumns = requiredColumns.filter(c => !columns.includes(c));
    if (missingColumns.length > 0) {
      console.error('Missing columns in users:', missingColumns);
    } else {
      console.log('All required columns exist in users table.');
    }

    const roleCol = colsRes.rows.find(r => r.column_name === 'role');
    if (roleCol) {
      console.log('role column type:', roleCol.udt_name);
    }

  } catch (err) {
    console.error('Error verifying database:', err);
  } finally {
    await client.end();
  }
}

verify();
