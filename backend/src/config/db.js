const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'ReservaHotelera',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

async function query(queryString, inputs = []) {
  const p = await getPool();
  const request = p.request();
  inputs.forEach(({ name, type, value }) => {
    request.input(name, type, value);
  });
  return request.query(queryString);
}

module.exports = { sql, getPool, query, config };
