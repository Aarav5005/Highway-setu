require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD.replace(/"/g, ''), database: process.env.DB_NAME, ssl: false });
client.connect().then(async () => {
  const res = await client.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'users'");
  console.log(res.rows.filter(r => ['language_pref', 'preferred_language', 'role'].includes(r.column_name)));
  client.end();
}).catch(e => console.error(e));
