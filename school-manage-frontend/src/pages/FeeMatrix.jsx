import React, { useEffect, useState } from 'react';
import { fetchJson, csvUrl } from '../services/api';

export default function FeeMatrix() {
  const [matrixRows, setMatrixRows] = useState([]);
  const [cls, setCls] = useState('');
  const [board, setBoard] = useState('CBSE');
  const [tuitionFee, setTuitionFee] = useState('');
  const [examFee, setExamFee] = useState('');
  const [libraryFee, setLibraryFee] = useState('');
  const [sportsFee, setSportsFee] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMatrix();
  }, []);

  async function loadMatrix() {
    try {
      const rows = await fetchJson('/api/fee-matrix');
      setMatrixRows(rows);
    } catch (err) {
      console.error(err);
      setStatusMessage('Unable to load fee matrix.');
    }
  }

  async function handleSaveMatrix() {
    if (!cls.trim() || !board.trim()) {
      setStatusMessage('Class and board are required.');
      return;
    }
    setLoading(true);
    setStatusMessage('');
    try {
      await fetchJson('/api/fee-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: cls,
          board,
          tuition_fee: Number(tuitionFee) || 0,
          exam_fee: Number(examFee) || 0,
          library_fee: Number(libraryFee) || 0,
          sports_fee: Number(sportsFee) || 0,
        }),
      });
      await loadMatrix();
      setStatusMessage('Fee matrix row saved successfully.');
      setCls('');
      setTuitionFee('');
      setExamFee('');
      setLibraryFee('');
      setSportsFee('');
    } catch (err) {
      console.error(err);
      setStatusMessage('Unable to save fee matrix row.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectRow(row) {
    setCls(String(row.class));
    setBoard(row.board);
    setTuitionFee(String(row.tuition_fee || ''));
    setExamFee(String(row.exam_fee || ''));
    setLibraryFee(String(row.library_fee || ''));
    setSportsFee(String(row.sports_fee || ''));
    setStatusMessage(`Editing class ${row.class} · ${row.board}`);
  }

  return (
    <div className="page-shell p-3 bg-white rounded shadow-sm">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h4 className="mb-1">Fee Matrix</h4>
          <p className="text-muted mb-0">Configure fee policies by class and board.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <a className="btn btn-outline-secondary" href={csvUrl('/api/students/export/csv')} target="_blank" rel="noreferrer">
            <i className="bi bi-file-earmark-spreadsheet me-1"></i>Export Students
          </a>
          <a className="btn btn-outline-secondary" href={csvUrl('/api/payments/export/csv')} target="_blank" rel="noreferrer">
            <i className="bi bi-file-earmark-spreadsheet me-1"></i>Export Payments
          </a>
        </div>
      </div>

      <div className="card card-body mb-4 shadow-sm">
        <div className="row g-3">
          <div className="col-sm-6 col-md-2">
            <label className="form-label">Class</label>
            <input className="form-control" value={cls} onChange={(e) => setCls(e.target.value)} placeholder="10" />
          </div>
          <div className="col-sm-6 col-md-2">
            <label className="form-label">Board</label>
            <select className="form-select" value={board} onChange={(e) => setBoard(e.target.value)}>
              <option>CBSE</option>
              <option>State Board</option>
              <option>ICSE</option>
              <option>Semi-English</option>
            </select>
          </div>
          <div className="col-sm-6 col-md-2">
            <label className="form-label">Tuition</label>
            <input className="form-control" value={tuitionFee} onChange={(e) => setTuitionFee(e.target.value)} placeholder="0" />
          </div>
          <div className="col-sm-6 col-md-2">
            <label className="form-label">Exam</label>
            <input className="form-control" value={examFee} onChange={(e) => setExamFee(e.target.value)} placeholder="0" />
          </div>
          <div className="col-sm-6 col-md-2">
            <label className="form-label">Library</label>
            <input className="form-control" value={libraryFee} onChange={(e) => setLibraryFee(e.target.value)} placeholder="0" />
          </div>
          <div className="col-sm-6 col-md-2">
            <label className="form-label">Sports</label>
            <input className="form-control" value={sportsFee} onChange={(e) => setSportsFee(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
          <button className="btn btn-primary" onClick={handleSaveMatrix} disabled={loading}>
            {loading ? 'Saving...' : 'Save Matrix'}
          </button>
          <button className="btn btn-outline-secondary" onClick={() => {
            setCls(''); setBoard('CBSE'); setTuitionFee(''); setExamFee(''); setLibraryFee(''); setSportsFee(''); setStatusMessage('');
          }}>
            Reset
          </button>
          {statusMessage && <span className="text-success small">{statusMessage}</span>}
        </div>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Class</th>
              <th>Board</th>
              <th>Tuition</th>
              <th>Exam</th>
              <th>Library</th>
              <th>Sports</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {matrixRows.length ? matrixRows.map((row) => (
              <tr key={row.id}>
                <td>{row.class}</td>
                <td>{row.board}</td>
                <td>₹{Number(row.tuition_fee || 0).toFixed(2)}</td>
                <td>₹{Number(row.exam_fee || 0).toFixed(2)}</td>
                <td>₹{Number(row.library_fee || 0).toFixed(2)}</td>
                <td>₹{Number(row.sports_fee || 0).toFixed(2)}</td>
                <td>₹{Number(row.total_fee || 0).toFixed(2)}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleSelectRow(row)}>
                    Edit
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">No fee matrix rows configured yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
