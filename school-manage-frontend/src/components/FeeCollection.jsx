import React, { useState, useEffect } from 'react';
import { csvUrl, fetchJson } from '../services/api';

function StudentRow({ s, onSelect }) {
  return (
    <tr>
      <td>{s.reg_no || s.id}</td>
      <td>{s.name}</td>
      <td>{s.class}</td>
      <td>{s.father_name || s.father}</td>
      <td>
        <button className="btn btn-sm btn-primary" onClick={() => onSelect(s)}>
          Select
        </button>
      </td>
    </tr>
  );
}

function PaymentRow({ payment }) {
  return (
    <tr>
      <td>{payment.receipt_no}</td>
      <td>{payment.reg_no}</td>
      <td>{payment.name}</td>
      <td>₹{Number(payment.total_amount || payment.amount || 0).toFixed(2)}</td>
      <td>{payment.payment_mode}</td>
      <td>{new Date(payment.created_at).toLocaleString()}</td>
    </tr>
  );
}

export default function FeeCollection() {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [registrationFee, setRegistrationFee] = useState('');
  const [tuitionFee, setTuitionFee] = useState('');
  const [busFee, setBusFee] = useState('');
  const [miscFee, setMiscFee] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [ddChequeNo, setDdChequeNo] = useState('');
  const [ddChequeDate, setDdChequeDate] = useState('');
  const [duesFees, setDuesFees] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [feeHeads, setFeeHeads] = useState([]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [sJson, fJson] = await Promise.all([
          fetchJson('/api/students'),
          fetchJson('/api/fee-heads'),
        ]);
        setStudents(sJson);
        setFeeHeads(fJson);
        await loadPayments();
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  useEffect(() => {
    if (!selected) return;
    loadPayments(selected.reg_no);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    const total = [registrationFee, tuitionFee, busFee, miscFee, duesFees].reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );
    setTotalAmount(total.toFixed(2));
  }, [registrationFee, tuitionFee, busFee, miscFee, duesFees]);

  async function loadPayments(regNo) {
    try {
      const filter = regNo ? `?reg_no=${encodeURIComponent(regNo)}` : '';
      const data = await fetchJson(`/api/payments${filter}`);
      setPayments(data);
    } catch (err) {
      console.error('Failed to load payments', err);
    }
  }

  async function handlePaymentSubmit() {
    if (!selected) {
      setStatusMessage('Please select a student before collecting payment.');
      return;
    }
    if (Number(totalAmount) <= 0) {
      setStatusMessage('Enter a valid total amount for the receipt.');
      return;
    }

    setSaving(true);
    setStatusMessage('');
    try {
      const result = await fetchJson('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selected.id,
          reg_no: selected.reg_no,
          student_name: selected.name,
          branch_standard: selected.branch || selected.standard || '',
          class: selected.class || '',
          academic_year: selected.academic_year || '',
          bus_no: selected.bus_no || '',
          bus_route: selected.bus_route || '',
          pickup_point: selected.pickup_point || '',
          registration_fee: Number(registrationFee || 0),
          tuition_fee: Number(tuitionFee || 0),
          bus_fee: Number(busFee || 0),
          misc_fee: Number(miscFee || 0),
          total_amount: Number(totalAmount || 0),
          payment_mode: paymentMode,
          bank_name: bankName || null,
          branch_name: branchName || null,
          dd_cheque_no: ddChequeNo || null,
          dd_cheque_date: ddChequeDate || null,
          utr_number: utrNumber || null,
          dues_fees: Number(duesFees || 0),
          note: note || null,
        }),
      });
      setReceipt(result);
      setStatusMessage('Payment recorded successfully.');
      setRegistrationFee('');
      setTuitionFee('');
      setBusFee('');
      setMiscFee('');
      setTotalAmount('');
      setPaymentMode('Cash');
      setBankName('');
      setBranchName('');
      setDdChequeNo('');
      setDdChequeDate('');
      setUtrNumber('');
      setDuesFees('');
      setNote('');
      await loadPayments(selected.reg_no);
    } catch (err) {
      console.error('Payment save failed', err);
      setStatusMessage('Unable to record payment.');
    } finally {
      setSaving(false);
    }
  }

  function handleSelectStudent(student) {
    setSelected(student);
    setReceipt(null);
    setStatusMessage('');
    setRegistrationFee('');
    setTuitionFee('');
    setBusFee('');
    setMiscFee('');
    setTotalAmount('');
    setPaymentMode('Cash');
    setBankName('');
    setBranchName('');
    setDdChequeNo('');
    setDdChequeDate('');
    setUtrNumber('');
    setDuesFees('');
    setNote('');
  }

  const feeTotal = feeHeads.reduce((sum, head) => sum + Number(head.amount || 0), 0);
  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(query.toLowerCase()) ||
    (s.reg_no || s.id || '').toString().toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fee-collection p-3 bg-white rounded shadow-sm">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h5 className="mb-1">Fee Collection & Receipts</h5>
          <p className="text-muted mb-0">Select a student, collect fees, and print a receipt.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-primary" onClick={() => loadPayments(selected?.reg_no)}>
            Refresh Payments
          </button>
          <a className="btn btn-outline-secondary" href={csvUrl('/api/payments/export/csv')} target="_blank" rel="noreferrer">
            <i className="bi bi-file-earmark-spreadsheet me-1"></i>Export Payments
          </a>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <div className="card card-body shadow-sm">
            <div className="mb-3 d-flex gap-2">
              <input
                className="form-control"
                placeholder="Search by name or reg no"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-outline-primary" onClick={() => {}}>
                Search
              </button>
            </div>

            {loading ? (
              <div className="text-muted">Loading students...</div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: 480 }}>
                <table className="table table-sm table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Reg</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length ? (
                      filtered.map((student) => (
                        <StudentRow key={student.id || student.reg_no} s={student} onSelect={handleSelectStudent} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          No students found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-xl-7">
          <div className="card card-body shadow-sm h-100">
            {selected ? (
              <>
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <h6 className="mb-1">Receipt for {selected.name}</h6>
                    <div className="small text-muted">Reg No: {selected.reg_no || selected.id}</div>
                  </div>
                  <div className="text-end">
                    <div className="small text-muted">Class: {selected.class || 'N/A'}</div>
                    <div className="small text-muted">Father: {selected.father_name || selected.father || 'N/A'}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">Receipt No</label>
                      <input className="form-control" value={receipt?.receipt_no || 'Will be generated'} readOnly />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Receipt Date</label>
                      <input className="form-control" value={receipt ? new Date(receipt.created_at).toLocaleString() : 'On save'} readOnly />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Branch / Standard</label>
                      <input className="form-control" value={selected.branch || selected.board || selected.standard || ''} readOnly />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Academic Year</label>
                      <input className="form-control" value={selected.academic_year || ''} readOnly />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Student Name</label>
                      <input className="form-control" value={selected.name} readOnly />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Class</label>
                      <input className="form-control" value={selected.class || ''} readOnly />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Reg No</label>
                      <input className="form-control" value={selected.reg_no || selected.id} readOnly />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Bus No</label>
                      <input className="form-control" value={selected.bus_no || ''} readOnly />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Bus Route</label>
                      <input className="form-control" value={selected.bus_route || ''} readOnly />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Pickup Point</label>
                      <input className="form-control" value={selected.pickup_point || ''} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Father / Guardian</label>
                      <input className="form-control" value={selected.father_name || selected.father || ''} readOnly />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Payment Mode</label>
                      <select className="form-select" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                        <option>Cash</option>
                        <option>D.D</option>
                        <option>Cheque</option>
                        <option>NEFT/UTR</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Bank / Branch</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="Bank Name"
                        />
                        <input
                          type="text"
                          className="form-control"
                          value={branchName}
                          onChange={(e) => setBranchName(e.target.value)}
                          placeholder="Branch"
                        />
                      </div>
                    </div>
                  </div>

                  {(paymentMode === 'D.D' || paymentMode === 'Cheque') && (
                    <div className="row g-3 mt-3">
                      <div className="col-md-6">
                        <label className="form-label">D.D / Cheque No.</label>
                        <input
                          type="text"
                          className="form-control"
                          value={ddChequeNo}
                          onChange={(e) => setDdChequeNo(e.target.value)}
                          placeholder="Enter number"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">D.D / Cheque Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={ddChequeDate}
                          onChange={(e) => setDdChequeDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMode === 'NEFT/UTR' && (
                    <div className="row g-3 mt-3">
                      <div className="col-md-12">
                        <label className="form-label">UTR Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="Enter UTR Number"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label">Note</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note or reference"
                  />
                </div>

                <div className="mb-4">
                  <h6 className="mb-3">Receipt Particulars</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <tbody>
                        <tr>
                          <td>Registration Fee</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={registrationFee}
                              min="0"
                              onChange={(e) => setRegistrationFee(e.target.value)}
                              placeholder="0.00"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Tuition Fee</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={tuitionFee}
                              min="0"
                              onChange={(e) => setTuitionFee(e.target.value)}
                              placeholder="0.00"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Bus Fee</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={busFee}
                              min="0"
                              onChange={(e) => setBusFee(e.target.value)}
                              placeholder="0.00"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Miscellaneous Fee</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={miscFee}
                              min="0"
                              onChange={(e) => setMiscFee(e.target.value)}
                              placeholder="0.00"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Dues / Fees</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={duesFees}
                              min="0"
                              onChange={(e) => setDuesFees(e.target.value)}
                              placeholder="0.00"
                            />
                          </td>
                        </tr>
                        <tr className="fw-semibold">
                          <td>Total Amount</td>
                          <td>
                            <input
                              className="form-control"
                              value={`₹${Number(totalAmount || 0).toFixed(2)}`}
                              readOnly
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Payment Mode</label>
                      <select
                        className="form-select"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        <option>Cash</option>
                        <option>D.D</option>
                        <option>Cheque</option>
                        <option>NEFT/UTR</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Bank / Branch</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="Bank Name"
                        />
                        <input
                          type="text"
                          className="form-control"
                          value={branchName}
                          onChange={(e) => setBranchName(e.target.value)}
                          placeholder="Branch"
                        />
                      </div>
                    </div>
                  </div>

                  {(paymentMode === 'D.D' || paymentMode === 'Cheque') && (
                    <div className="row g-3 mt-3">
                      <div className="col-md-6">
                        <label className="form-label">D.D / Cheque No.</label>
                        <input
                          type="text"
                          className="form-control"
                          value={ddChequeNo}
                          onChange={(e) => setDdChequeNo(e.target.value)}
                          placeholder="Enter number"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">D.D / Cheque Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={ddChequeDate}
                          onChange={(e) => setDdChequeDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMode === 'NEFT/UTR' && (
                    <div className="row g-3 mt-3">
                      <div className="col-md-12">
                        <label className="form-label">UTR Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="Enter UTR Number"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <button className="btn btn-success" onClick={handlePaymentSubmit} disabled={saving}>
                    {saving ? 'Recording...' : 'Collect Payment'}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => window.print()}
                    disabled={!receipt}
                  >
                    Print Receipt
                  </button>
                  {statusMessage && <span className="text-success small">{statusMessage}</span>}
                </div>

                {receipt && (
                  <div className="mt-4 p-3 border rounded bg-light receipt-preview">
                    <div className="d-flex justify-content-between mb-3">
                      <div>
                        <h6 className="mb-1">Receipt Preview</h6>
                        <div className="small text-muted">Receipt ID: {receipt.receipt_no}</div>
                      </div>
                      <div className="text-end">
                        <div className="small">Collected: ₹{Number(receipt.total_amount || receipt.amount || 0).toFixed(2)}</div>
                        <div className="small">Mode: {receipt.payment_mode}</div>
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-sm-6">
                        <strong>Student</strong>
                        <div>{selected.name}</div>
                        <div className="small text-muted">{selected.reg_no}</div>
                      </div>
                      <div className="col-sm-6 text-sm-end">
                        <strong>Date</strong>
                        <div>{new Date(receipt.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div>
                      <strong>Note</strong>
                      <div className="small text-muted">{receipt.note || 'No note provided.'}</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted">Select a student to start collection and prepare a receipt.</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 card card-body shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="mb-1">Recent Payments</h6>
            <p className="text-muted mb-0">Latest receipt activity{selected ? ` for ${selected.name}` : ''}.</p>
          </div>
          <button className="btn btn-sm btn-outline-primary" onClick={() => loadPayments(selected?.reg_no)}>
            Refresh
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-sm table-hover mb-0">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Reg No</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length ? (
                payments.map((payment) => <PaymentRow key={payment.id} payment={payment} />)
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
