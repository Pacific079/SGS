const mysql = require('mysql2/promise');

(async () => {
  const config = { host: 'localhost', user: 'root', password: '', database: 'school_manage' };
  try {
    const conn = await mysql.createConnection(config);
    const [heads] = await conn.query('SELECT COUNT(*) AS count FROM fee_heads');
    const [students] = await conn.query('SELECT COUNT(*) AS count FROM students');
    const [headsRows] = await conn.query('SELECT name, amount FROM fee_heads ORDER BY name');
    const [studentRows] = await conn.query('SELECT reg_no, name, `class`, board FROM students ORDER BY `class`, board LIMIT 10');
    console.log('fee_heads count=', heads[0].count);
    console.log('students count=', students[0].count);
    console.log('fee_heads sample=', JSON.stringify(headsRows, null, 2));
    console.log('students sample=', JSON.stringify(studentRows, null, 2));
    await conn.end();
  } catch (err) {
    console.error('ERROR', err.message);
    process.exit(1);
  }
})();
