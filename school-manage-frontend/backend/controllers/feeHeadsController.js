const db = require('../db');

async function listFeeHeads(req, res) {
  const pool = db.getPool();
  if (!pool) {
    return res.json([
      { id: 1, name: 'Tuition', amount: 5000 },
      { id: 2, name: 'Transport', amount: 800 },
      { id: 3, name: 'Library', amount: 200 },
    ]);
  }
  try {
    const [rows] = await pool.query('SELECT id, name, amount FROM fee_heads');
    res.json(rows);
  } catch (err) {
    console.warn('feeHeadsController.list error:', err.message);
    res.status(500).json({ error: 'db' });
  }
}

module.exports = { listFeeHeads };
