const express = require('express');
const cors = require('cors');
const dbModule = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
// Try to initialize DB from schema.sql (best effort)
const fs = require('fs');
const path = require('path');
const studentsRouter = require('./routes/students');
const feeHeadsRouter = require('./routes/feeHeads');
const feeMatrixRouter = require('./routes/feeMatrix');
const paymentsRouter = require('./routes/payments');

let pool;
let dbReady = false;
// in-memory fallback store for demos when DB is not available
const _mockStudents = [];
let _mockId = 1000;

async function start() {
  try {
    pool = await dbModule.init();
    dbReady = true;

    // run schema.sql (idempotent)
    const sqlPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(sqlPath)) {
      try {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sql);
        console.log('Database schema executed (if necessary).');
      } catch (err) {
        console.warn('Schema execution failed:', err.message);
      }
    }
    // ensure reg_no can be NULL on insert so we can populate after insert
    try {
      await pool.query("ALTER TABLE students MODIFY reg_no VARCHAR(50) NULL;");
    } catch (err) {
      // ignore errors (table may not exist yet or alter not needed)
    }

    try {
      await pool.query(`ALTER TABLE students
        ADD COLUMN IF NOT EXISTS board VARCHAR(100),
        ADD COLUMN IF NOT EXISTS email VARCHAR(150),
        ADD COLUMN IF NOT EXISTS admission_number VARCHAR(100),
        ADD COLUMN IF NOT EXISTS admission_date DATE,
        ADD COLUMN IF NOT EXISTS admission_year VARCHAR(20),
        ADD COLUMN IF NOT EXISTS category VARCHAR(50),
        ADD COLUMN IF NOT EXISTS section VARCHAR(50),
        ADD COLUMN IF NOT EXISTS bus_no VARCHAR(50),
        ADD COLUMN IF NOT EXISTS bus_route VARCHAR(150),
        ADD COLUMN IF NOT EXISTS pickup_point VARCHAR(150)`);
    } catch (err) {
      console.warn('student table alter failed:', err.message);
    }

    // add additional admission form columns so we can persist full admission data
    try {
      await pool.query(`ALTER TABLE students
        ADD COLUMN IF NOT EXISTS admission_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS rte_app_number VARCHAR(100),
        ADD COLUMN IF NOT EXISTS dob DATE,
        ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
        ADD COLUMN IF NOT EXISTS adhar_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS pen VARCHAR(100),
        ADD COLUMN IF NOT EXISTS apaar_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS alternate_mobile VARCHAR(50),
        ADD COLUMN IF NOT EXISTS father_qualification VARCHAR(150),
        ADD COLUMN IF NOT EXISTS father_occupation VARCHAR(150),
        ADD COLUMN IF NOT EXISTS father_adhar VARCHAR(50),
        ADD COLUMN IF NOT EXISTS mother_name VARCHAR(200),
        ADD COLUMN IF NOT EXISTS mother_qualification VARCHAR(150),
        ADD COLUMN IF NOT EXISTS mother_occupation VARCHAR(150),
        ADD COLUMN IF NOT EXISTS mother_adhar VARCHAR(50),
        ADD COLUMN IF NOT EXISTS residential_area VARCHAR(50),
        ADD COLUMN IF NOT EXISTS house_number VARCHAR(100),
        ADD COLUMN IF NOT EXISTS ward_number VARCHAR(100),
        ADD COLUMN IF NOT EXISTS colony_area VARCHAR(150),
        ADD COLUMN IF NOT EXISTS city_village VARCHAR(150),
        ADD COLUMN IF NOT EXISTS block VARCHAR(100),
        ADD COLUMN IF NOT EXISTS tehsil VARCHAR(100),
        ADD COLUMN IF NOT EXISTS district VARCHAR(150),
        ADD COLUMN IF NOT EXISTS state VARCHAR(150),
        ADD COLUMN IF NOT EXISTS pincode VARCHAR(20),
        ADD COLUMN IF NOT EXISTS previous_session VARCHAR(50),
        ADD COLUMN IF NOT EXISTS previous_class VARCHAR(50),
        ADD COLUMN IF NOT EXISTS previous_scholar_number VARCHAR(100),
        ADD COLUMN IF NOT EXISTS previous_school_name VARCHAR(200),
        ADD COLUMN IF NOT EXISTS previous_result VARCHAR(200),
        ADD COLUMN IF NOT EXISTS previous_grade VARCHAR(50),
        ADD COLUMN IF NOT EXISTS previous_attendance VARCHAR(50),
        ADD COLUMN IF NOT EXISTS vehicle_service VARCHAR(20),
        ADD COLUMN IF NOT EXISTS vehicle_route VARCHAR(150),
        ADD COLUMN IF NOT EXISTS vehicle_period VARCHAR(50),
        ADD COLUMN IF NOT EXISTS vehicle_start_date DATE,
        ADD COLUMN IF NOT EXISTS vehicle_end_date DATE,
        ADD COLUMN IF NOT EXISTS vehicle_months VARCHAR(20),
        ADD COLUMN IF NOT EXISTS vehicle_fee_total DECIMAL(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS vehicle_fee_discount DECIMAL(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS vehicle_fee_payable DECIMAL(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS admission_fee DECIMAL(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS tuition_fee DECIMAL(12,2) DEFAULT 0`);
    } catch (err) {
      console.warn('student table extend failed:', err.message);
    }

    try {
      await pool.query(`ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS registration_fee DECIMAL(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS tuition_fee DECIMAL(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS bus_fee DECIMAL(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS misc_fee DECIMAL(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS bank_name VARCHAR(150),
        ADD COLUMN IF NOT EXISTS branch_name VARCHAR(150),
        ADD COLUMN IF NOT EXISTS dd_cheque_no VARCHAR(100),
        ADD COLUMN IF NOT EXISTS dd_cheque_date DATE,
        ADD COLUMN IF NOT EXISTS dues_fees DECIMAL(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS utr_number VARCHAR(150)`);
    } catch (err) {
      console.warn('payment table alter failed:', err.message);
    }

    await cleanupFeeHeadDuplicates();

    // ensure fee head names are unique for idempotent seed operations
    try {
      await pool.query('ALTER TABLE fee_heads ADD UNIQUE KEY ux_fee_head_name (name)');
    } catch (err) {
      // ignore if the index already exists or if table not yet created or if duplicates exist
    }

    await seedFeeHeads();
    await seedStudents();

    // mount routers after DB init
    app.use('/api/students', studentsRouter);
    app.use('/api/fee-heads', feeHeadsRouter);
    app.use('/api/fee-matrix', feeMatrixRouter);
    app.use('/api/payments', paymentsRouter);

    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

async function cleanupFeeHeadDuplicates() {
  if (!pool) return;
  try {
    await pool.query(`DELETE h1 FROM fee_heads h1
      INNER JOIN fee_heads h2
      ON h1.name = h2.name AND h1.id > h2.id`);
  } catch (err) {
    console.warn('fee_heads dedupe failed:', err.message);
  }
}

async function seedFeeHeads() {
  if (!pool) return;
  const feeHeads = [
    { name: 'Tuition', amount: 5000.0 },
    { name: 'Transport', amount: 800.0 },
    { name: 'Library', amount: 250.0 },
    { name: 'Exam', amount: 450.0 },
    { name: 'Sports', amount: 300.0 },
  ];

  for (const head of feeHeads) {
    await pool.query(
      'INSERT INTO fee_heads (name, amount) VALUES (?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount)',
      [head.name, head.amount]
    );
  }
}

async function seedStudents() {
  if (!pool) return;
  try {
    const [existingRows] = await pool.query('SELECT reg_no FROM students');
    const existingRegNos = new Set(existingRows.map((row) => row.reg_no));

    const boards = ['CBSE', 'State Board'];
    const surnames = ['Sharma', 'Patil', 'Desai', 'Joshi', 'Kulkarni'];
    const givenNames = ['Rohan', 'Priya', 'Amit', 'Sneha', 'Kiran', 'Neha', 'Rahul', 'Alisha', 'Kavya', 'Vivek'];
    const students = [];
    const year = new Date().getFullYear();

    for (let cls = 1; cls <= 12; cls += 1) {
      for (const board of boards) {
        for (let idx = 0; idx < 5; idx += 1) {
          const name = `${givenNames[(cls + idx) % givenNames.length]} ${surnames[idx % surnames.length]}`;
          const regNo = `REG${year}${String(cls).padStart(2, '0')}${board === 'CBSE' ? 'C' : 'S'}${String(idx + 1).padStart(2, '0')}`;
          if (existingRegNos.has(regNo)) continue;
          const admissionNumber = `ADM${String(cls).padStart(2, '0')}${String(idx + 1).padStart(2, '0')}`;
          students.push([
            regNo,
            name,
            String(cls),
            board,
            `${name.split(' ')[0]}'s Father`,
            `90000${String(cls).padStart(2, '0')}${String(idx + 1).padStart(2, '0')}`,
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
      await pool.query(
        'INSERT INTO students (reg_no, name, `class`, board, father_name, phone, email, admission_number, admission_date, admission_year, category, section) VALUES ? ON DUPLICATE KEY UPDATE reg_no = reg_no',
        [students]
      );
      console.log(`Seeded ${students.length} demo student records.`);
    }
  } catch (err) {
    console.warn('Student seed failed:', err.message);
  }
}

start();
