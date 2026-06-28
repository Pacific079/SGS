const mysql = require('mysql2/promise');

(async () => {
  const config = { host: 'localhost', user: 'root', password: '', database: 'school_manage' };
  const feeHeads = [
    { name: 'Tuition', amount: 5000.0 },
    { name: 'Transport', amount: 800.0 },
    { name: 'Library', amount: 250.0 },
    { name: 'Exam', amount: 450.0 },
    { name: 'Sports', amount: 300.0 },
  ];

  try {
    const conn = await mysql.createConnection(config);

    console.log('Cleaning duplicate fee_heads...');
    await conn.query(`DELETE h1 FROM fee_heads h1
      INNER JOIN fee_heads h2
      ON h1.name = h2.name AND h1.id > h2.id`);

    try {
      await conn.query('ALTER TABLE fee_heads ADD UNIQUE KEY ux_fee_head_name (name)');
      console.log('Added unique index on fee_heads.name');
    } catch (err) {
      console.log('Unique index on fee_heads.name exists or could not be added:', err.message);
    }

    for (const head of feeHeads) {
      await conn.query(
        'INSERT INTO fee_heads (name, amount) VALUES (?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount)',
        [head.name, head.amount]
      );
    }
    console.log('Seeded fee_heads.');

    const boards = ['CBSE', 'State Board'];
    const surnames = ['Sharma', 'Patil', 'Desai', 'Joshi', 'Kulkarni'];
    const givenNames = ['Rohan', 'Priya', 'Amit', 'Sneha', 'Kiran', 'Neha', 'Rahul', 'Alisha', 'Kavya', 'Vivek'];
    const year = new Date().getFullYear();
    const students = [];

    for (let cls = 1; cls <= 12; cls += 1) {
      for (const board of boards) {
        for (let idx = 1; idx <= 5; idx += 1) {
          const name = `${givenNames[(cls + idx) % givenNames.length]} ${surnames[(idx - 1) % surnames.length]}`;
          const regNo = `REG${year}${String(cls).padStart(2, '0')}${board === 'CBSE' ? 'C' : 'S'}${String(idx).padStart(2, '0')}`;
          const admissionNumber = `ADM${String(cls).padStart(2, '0')}${String(idx).padStart(2, '0')}`;
          students.push([
            regNo,
            name,
            String(cls),
            board,
            `${name.split(' ')[0]}'s Father`,
            `90000${String(cls).padStart(2, '0')}${String(idx).padStart(2, '0')}`,
            `${name.split(' ')[0].toLowerCase()}@school.com`,
            admissionNumber,
            `${year}-04-01`,
            String(year),
            'General',
            'A',
          ]);
        }
      }
    }

    if (students.length > 0) {
      await conn.query(
        'INSERT INTO students (reg_no, name, `class`, board, father_name, phone, email, admission_number, admission_date, admission_year, category, section) VALUES ? ON DUPLICATE KEY UPDATE reg_no = reg_no',
        [students]
      );
      console.log(`Seeded ${students.length} demo students.`);
    }

    const [feeCount] = await conn.query('SELECT COUNT(*) AS count FROM fee_heads');
    const [studentCount] = await conn.query('SELECT COUNT(*) AS count FROM students');
    console.log('fee_heads count=', feeCount[0].count);
    console.log('students count=', studentCount[0].count);

    await conn.end();
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
