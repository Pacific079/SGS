const db = require('../db');

async function listMatrix(req, res) {
  const pool = db.getPool();
  if (!pool) return res.json([]);
  try {
    const [rows] = await pool.query('SELECT id, class, board, tuition_fee, exam_fee, library_fee, sports_fee, total_fee FROM fee_matrix ORDER BY class, board');
    res.json(rows);
  } catch (err) {
    console.error('feeMatrix.list error:', err.message);
    res.status(500).json({ error: 'db' });
  }
}

async function upsertMatrix(req, res) {
  const { class: cls, board, tuition_fee = 0, exam_fee = 0, library_fee = 0, sports_fee = 0 } = req.body;
  if (!cls || !board) return res.status(400).json({ error: 'class_board_required' });
  const total = Number(tuition_fee) + Number(exam_fee) + Number(library_fee) + Number(sports_fee);
  const pool = db.getPool();
  if (!pool) return res.status(500).json({ error: 'db_unavailable' });
  try {
    // try update
    const [updated] = await pool.query('UPDATE fee_matrix SET tuition_fee=?, exam_fee=?, library_fee=?, sports_fee=?, total_fee=? WHERE class=? AND board=?', [tuition_fee, exam_fee, library_fee, sports_fee, total, cls, board]);
    if (updated.affectedRows) {
      const [rows] = await pool.query('SELECT * FROM fee_matrix WHERE class=? AND board=?', [cls, board]);
      return res.json(rows[0]);
    }
    // insert
    const [ins] = await pool.query('INSERT INTO fee_matrix (class, board, tuition_fee, exam_fee, library_fee, sports_fee, total_fee) VALUES (?, ?, ?, ?, ?, ?, ?)', [cls, board, tuition_fee, exam_fee, library_fee, sports_fee, total]);
    const [rows] = await pool.query('SELECT * FROM fee_matrix WHERE id = ?', [ins.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('upsertMatrix failed:', err.message);
    res.status(500).json({ error: 'db' });
  }
}

module.exports = { listMatrix, upsertMatrix };
