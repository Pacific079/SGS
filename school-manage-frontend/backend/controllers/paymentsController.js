const db = require('../db');

function genReceiptNo() {
  const now = new Date();
  const yy = now.getFullYear();
  const ts = now.getTime();
  return `RCPT${yy}${String(ts).slice(-6)}`;
}

async function createPayment(req, res) {
  const {
    reg_no,
    student_id,
    registration_fee = 0,
    tuition_fee = 0,
    bus_fee = 0,
    misc_fee = 0,
    total_amount,
    payment_mode = 'Cash',
    bank_name = null,
    branch_name = null,
    dd_cheque_no = null,
    dd_cheque_date = null,
    dues_fees = 0,
    utr_number = null,
    note = null,
  } = req.body;

  if (total_amount == null || Number(total_amount) < 0) return res.status(400).json({ error: 'total_amount_required' });
  const pool = db.getPool();
  if (!pool) return res.status(500).json({ error: 'db_unavailable' });
  try {
    let sid = student_id;
    if (!sid) {
      if (!reg_no) return res.status(400).json({ error: 'student_identifier_required' });
      const [rows] = await pool.query('SELECT id FROM students WHERE reg_no = ? LIMIT 1', [reg_no]);
      if (!rows.length) return res.status(404).json({ error: 'student_not_found' });
      sid = rows[0].id;
    }
    const receipt_no = genReceiptNo();
    const [result] = await pool.query(
      'INSERT INTO payments (receipt_no, student_id, registration_fee, tuition_fee, bus_fee, misc_fee, total_amount, payment_mode, bank_name, branch_name, dd_cheque_no, dd_cheque_date, dues_fees, utr_number, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [receipt_no, sid, registration_fee, tuition_fee, bus_fee, misc_fee, total_amount, payment_mode, bank_name, branch_name, dd_cheque_no, dd_cheque_date || null, dues_fees, utr_number, note || null]
    );
    const [rows] = await pool.query('SELECT p.*, s.reg_no, s.name FROM payments p JOIN students s ON s.id = p.student_id WHERE p.id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createPayment failed:', err.message);
    res.status(500).json({ error: 'db' });
  }
}

async function listPayments(req, res) {
  const pool = db.getPool();
  if (!pool) return res.json([]);
  try {
    const filters = [];
    const values = [];
    if (req.query.reg_no) {
      filters.push('s.reg_no = ?');
      values.push(req.query.reg_no);
    }
    const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
    const [rows] = await pool.query(`SELECT p.id, p.receipt_no, p.student_id, p.registration_fee, p.tuition_fee, p.bus_fee, p.misc_fee, p.total_amount, p.payment_mode, p.bank_name, p.branch_name, p.dd_cheque_no, p.dd_cheque_date, p.dues_fees, p.utr_number, p.note, p.created_at, s.reg_no, s.name FROM payments p JOIN students s ON s.id = p.student_id ${whereClause} ORDER BY p.created_at DESC LIMIT 500`, values);
    res.json(rows);
  } catch (err) {
    console.error('listPayments failed:', err.message);
    res.status(500).json({ error: 'db' });
  }
}

async function exportCsv(req, res) {
  const pool = db.getPool();
  if (!pool) return res.status(500).send('DB unavailable');
  try {
    const [rows] = await pool.query('SELECT p.receipt_no, p.student_id, p.registration_fee, p.tuition_fee, p.bus_fee, p.misc_fee, p.total_amount, p.payment_mode, p.bank_name, p.branch_name, p.dd_cheque_no, p.dd_cheque_date, p.dues_fees, p.utr_number, p.note, p.created_at, s.reg_no, s.name FROM payments p JOIN students s ON s.id = p.student_id ORDER BY p.created_at DESC');
    const header = ['receipt_no','student_id','reg_no','name','registration_fee','tuition_fee','bus_fee','misc_fee','total_amount','payment_mode','bank_name','branch_name','dd_cheque_no','dd_cheque_date','dues_fees','utr_number','note','created_at'];
    const csv = [header.join(',')].concat(rows.map(r => header.map(h => `"${(r[h]||'').toString().replace(/"/g,'""')}"`).join(','))).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');
    res.send(csv);
  } catch (err) {
    console.error('export payments failed:', err.message);
    res.status(500).send('export_failed');
  }
}

module.exports = { createPayment, listPayments, exportCsv };

