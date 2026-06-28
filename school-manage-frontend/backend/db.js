const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'school_manage';

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true,
};

async function init() {
  // create database if not exists using a temporary connection
  const tmp = await mysql.createConnection({ ...baseConfig });
  await tmp.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await tmp.end();

  // create pool connected to the database
  poolVar = mysql.createPool({ ...baseConfig, database: DB_NAME });
  return poolVar;
}

let poolVar = null;

function getPool() {
  return poolVar;
}

module.exports = { init, getPool };
