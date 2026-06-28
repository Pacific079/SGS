const mysql = require('mysql2/promise');

(async () => {
  const config = { host: 'localhost', user: 'root', password: '', database: 'school_manage' };
  try {
    const conn = await mysql.createConnection(config);
    const [heads] = await conn.query('SELECT name, amount, COUNT(*) AS cnt FROM fee_heads GROUP BY name, amount ORDER BY name, amount');
    const [headTotals] = await conn.query('SELECT COUNT(*) AS total, COUNT(DISTINCT name) AS distinct_names FROM fee_heads');
    const [students] = await conn.query('SELECT COUNT(*) AS count FROM students');
    const [studentSample] = await conn.query('SELECT reg_no, name, `class`, board, admission_number FROM students ORDER BY `class`, board LIMIT 20');
    console.log('fee_heads totals=', headTotals[0]);
    console.log('fee_heads rows=');
    console.table(heads);
    console.log('students count=', students[0].count);
    console.table(studentSample);
    await conn.end();
  } catch (err) {
    console.error('ERROR', err.message);
    process.exit(1);
  }
})();
