import React, { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '../services/api';

function buildCsv(rows) {
  const headers = ['Reg No', 'Name', 'Class', 'Board', 'Father Name', 'Phone', 'Email', 'Admission Year', 'Category', 'Section'];
  const escapeValue = (value) => {
    const text = value == null ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(
      headers
        .map((header) => {
          const key = header.toLowerCase().replace(/ /g, '_');
          const value = row[key] || row[header.toLowerCase()] || '';
          return escapeValue(value);
        })
        .join(','),
    );
  });

  return lines.join('\n');
}

function downloadCsv(rows, filename = 'student-record.csv') {
  const csv = buildCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const classOptions = ['All', ...Array.from({ length: 12 }, (_, index) => String(index + 1))];
const boardOptions = ['All', 'CBSE', 'State Board', 'Semi-English'];

export default function StudentRecord() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [boardFilter, setBoardFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [regNoSearch, setRegNoSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const data = await fetchJson('/api/students');
        setStudents(data || []);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Unable to load student records.');
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);


  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const regTerm = regNoSearch.trim().toLowerCase();
    return students.filter((student) => {
      const studentClass = String(student.class || '').trim();
      const classMatch = classFilter === 'All' || studentClass === classFilter || new RegExp(`^${classFilter}(?:[^0-9]|$)`).test(studentClass);
      const matchesClass = classFilter === 'All' ? true : classMatch;
      const matchesBoard = boardFilter === 'All' || String(student.board || '').toLowerCase() === boardFilter.toLowerCase();
      const matchesSearch =
        !term ||
        String(student.name || '').toLowerCase().includes(term) ||
        String(student.reg_no || '').toLowerCase().includes(term);
      const matchesRegNo = !regTerm || String(student.reg_no || '').toLowerCase().includes(regTerm);

      return matchesClass && matchesBoard && matchesSearch && matchesRegNo;
    });
  }, [students, classFilter, boardFilter, searchTerm, regNoSearch]);

  useEffect(() => {
    if (!filteredStudents.length) {
      setSelectedStudent(null);
      return;
    }

    if (!selectedStudent || !filteredStudents.some((student) => student.id === selectedStudent.id)) {
      setSelectedStudent(filteredStudents[0]);
    }
  }, [filteredStudents, selectedStudent]);

  useEffect(() => {
    async function loadPayments() {
      if (!selectedStudent || !selectedStudent.reg_no) return setPayments([]);
      try {
        const rows = await fetchJson(`/api/payments?reg_no=${encodeURIComponent(selectedStudent.reg_no)}`);
        setPayments(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.warn('loadPayments failed:', err.message || err);
        setPayments([]);
      }
    }

    loadPayments();
  }, [selectedStudent]);

  const timelineEntries = useMemo(() => {
    if (!selectedStudent) return [];

    const baseYear = selectedStudent.admission_year || '2026-27';
    return [
      {
        year: baseYear,
        label: 'Admission Record',
        detail: `${selectedStudent.category || 'General'} • Section ${selectedStudent.section || '—'}`,
      },
      {
        year: selectedStudent.admission_date || 'Recorded',
        label: 'Admission Date',
        detail: selectedStudent.admission_number || 'Registration available',
      },
    ];
  }, [selectedStudent]);

  return (
    <div className="page-shell p-3 bg-white rounded shadow-sm">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h4 className="mb-1">Student Record</h4>
          <p className="text-muted mb-0">Monitor class-wise records and open an individual student profile.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-secondary" onClick={() => downloadCsv(filteredStudents)}>
            <i className="bi bi-file-earmark-excel me-1"></i>Export Excel
          </button>
          <button className="btn btn-outline-secondary" onClick={() => window.print()}>
            <i className="bi bi-file-earmark-pdf me-1"></i>Export PDF
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card card-body shadow-sm h-100">
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Class</label>
                <select className="form-select" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                  {classOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'All' ? option : `Class ${option}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Board</label>
                <select className="form-select" value={boardFilter} onChange={(e) => setBoardFilter(e.target.value)}>
                  {boardOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Search</label>
                <input
                  className="form-control"
                  placeholder="Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Reg No</label>
                <div className="input-group">
                  <input
                    className="form-control"
                    placeholder="Search by registration number"
                    value={regNoSearch}
                    onChange={(e) => setRegNoSearch(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      if (!regNoSearch.trim()) return;
                      const found = students.find((student) =>
                        String(student.reg_no || '').toLowerCase() === regNoSearch.trim().toLowerCase(),
                      );
                      if (found) {
                        setSelectedStudent(found);
                        setClassFilter('All');
                        setBoardFilter('All');
                        setSearchTerm('');
                      }
                    }}
                  >
                    Find
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <div className="alert alert-danger mb-0">{error}</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Reg No</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Board</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          Loading student records...
                        </td>
                      </tr>
                    ) : filteredStudents.length ? (
                      filteredStudents.map((student) => (
                        <tr key={student.id || student.reg_no}>
                          <td>{student.reg_no || '—'}</td>
                          <td>{student.name || '—'}</td>
                          <td>{student.class || '—'}</td>
                          <td>{student.board || '—'}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedStudent(student)}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No matching student records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card card-body shadow-sm h-100">
            {selectedStudent ? (
              <>
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <h6 className="mb-1">{selectedStudent.name || 'Student Profile'}</h6>
                    <p className="text-muted mb-0">Reg No: {selectedStudent.reg_no || '—'}</p>
                  </div>
                  <span className="badge bg-primary-subtle text-primary">{selectedStudent.class || '—'}</span>
                </div>
                <div className="row g-3 mt-1">
                  <div className="col-6">
                    <label className="form-label small text-muted">Board</label>
                    <div>{selectedStudent.board || '—'}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Father</label>
                    <div>{selectedStudent.father_name || '—'}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Phone</label>
                    <div>{selectedStudent.phone || '—'}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Email</label>
                    <div>{selectedStudent.email || '—'}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">DOB</label>
                    <div>{selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : '—'}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Gender</label>
                    <div>{selectedStudent.gender || '—'}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Aadhaar</label>
                    <div>{selectedStudent.adhar_number || '—'}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Admission No</label>
                    <div>{selectedStudent.admission_number || '—'}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h6 className="mb-2">Address & Contact</h6>
                  <div className="small text-muted mb-2">
                    {selectedStudent.house_number || ''} {selectedStudent.colony_area || ''} {selectedStudent.city_village || ''}
                  </div>
                  <div className="small text-muted">{(selectedStudent.district || '') + (selectedStudent.state ? ', ' + selectedStudent.state : '')}</div>
                  <div className="small text-muted">PIN: {selectedStudent.pincode || '—'}</div>
                </div>

                <div className="mt-4">
                  <h6 className="mb-2">Parents</h6>
                  <div className="small text-muted">Father: {selectedStudent.father_name || '—'} — {selectedStudent.father_occupation || ''} {selectedStudent.father_qualification ? '• ' + selectedStudent.father_qualification : ''}</div>
                  <div className="small text-muted">Mother: {selectedStudent.mother_name || '—'} — {selectedStudent.mother_occupation || ''} {selectedStudent.mother_qualification ? '• ' + selectedStudent.mother_qualification : ''}</div>
                </div>

                <div className="mt-4">
                  <h6 className="mb-2">Vehicle & Fees</h6>
                  <div className="small text-muted">Service: {selectedStudent.vehicle_service || 'no'}</div>
                  <div className="small text-muted">Route: {selectedStudent.vehicle_route || selectedStudent.bus_route || '—'}</div>
                  <div className="small text-muted">Vehicle Payable: {selectedStudent.vehicle_fee_payable || '0.00'}</div>
                  <div className="small text-muted">Admission Fee: {selectedStudent.admission_fee || '0.00'} • Tuition Fee: {selectedStudent.tuition_fee || '0.00'}</div>
                </div>

                <div className="mt-4">
                  <h6 className="mb-2">Academic Summary</h6>
                  <div className="list-group list-group-flush">
                    {timelineEntries.map((entry) => (
                      <div key={`${entry.label}-${entry.year}`} className="list-group-item px-0 py-2">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <div className="fw-semibold">{entry.label}</div>
                            <div className="small text-muted">{entry.detail}</div>
                          </div>
                          <span className="badge bg-light text-dark">{entry.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h6 className="mb-2">Payments</h6>
                  {payments.length ? (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead className="table-light">
                          <tr>
                            <th>Receipt</th>
                            <th>Date</th>
                            <th>Mode</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p) => (
                            <tr key={p.id}>
                              <td>{p.receipt_no}</td>
                              <td>{p.created_at ? new Date(p.created_at).toLocaleString() : ''}</td>
                              <td>{p.payment_mode}</td>
                              <td>{Number(p.total_amount || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-muted">No payments recorded for this student.</div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-muted py-4">Select a student to view full profile details.</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .sidebar, .top-header, .mobile-toggle, .btn, .footer {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .page-shell {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
