import React, { useEffect, useState } from 'react';
import { fetchJson } from '../services/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentsCount, setStudentsCount] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [routesCount, setRoutesCount] = useState(0);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const [students, payments] = await Promise.all([
        fetchJson('/api/students'),
        fetchJson('/api/payments'),
      ]);

      const studentsArr = Array.isArray(students) ? students : [];
      const paymentsArr = Array.isArray(payments) ? payments : [];

      setStudentsCount(studentsArr.length);

      const total = paymentsArr.reduce((s, p) => s + Number(p.total_amount || 0), 0);
      setTotalPayments(total);

      const paidStudentIds = new Set(paymentsArr.map((p) => p.student_id || p.reg_no));
      const pending = studentsArr.filter((s) => !paidStudentIds.has(s.id) && !paidStudentIds.has(s.reg_no)).length;
      setPendingCount(pending);

      const routes = new Set(studentsArr.map((s) => (s.bus_route || s.bus_no || s.pickup_point || '').trim()).filter(Boolean));
      setRoutesCount(routes.size);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="page-shell p-3 bg-white rounded shadow-sm">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h4 className="mb-1">Welcome to EduFlow</h4>
          <p className="text-muted mb-0">Manage students, fee collections, and reporting from a single dashboard.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={loadStats} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-primary">View Reports</button>
        </div>
      </div>

      <div className="row g-3 mt-4">
        <div className="col-md-3">
          <div className="dashboard-card p-3 rounded shadow-sm bg-light">
            <div className="text-muted small">Active Students</div>
            <div className="fs-4 fw-semibold">{studentsCount}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card p-3 rounded shadow-sm bg-light">
            <div className="text-muted small">Pending Fees</div>
            <div className="fs-4 fw-semibold">{pendingCount}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card p-3 rounded shadow-sm bg-light">
            <div className="text-muted small">Total Payments</div>
            <div className="fs-4 fw-semibold">{totalPayments.toFixed(2)}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card p-3 rounded shadow-sm bg-light">
            <div className="text-muted small">Routes</div>
            <div className="fs-4 fw-semibold">{routesCount}</div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-4">{error}</div>}
    </div>
  );
}
