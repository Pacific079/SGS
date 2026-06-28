import React, { useEffect, useState } from 'react';
import { API_BASE, fetchJson } from '../services/api';

const admissionTypes = [
  { value: 'regular_child_1', label: 'Regular Child 1' },
  { value: 'child_2', label: 'Child 2' },
  { value: 'rte', label: 'RTE' },
  { value: 'sport', label: 'Sport' },
  { value: 'administrative_candidate', label: 'Administrative Candidate' },
];

const genderOptions = ['Male', 'Female', 'Other'];
const residentialOptions = ['Urban', 'Rural'];
const boardOptions = ['CBSE', 'State Board', 'Semi-English'];
const classOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));

const initialForm = {
  admission_number: '',
  admission_date: '',
  admission_type: 'regular_child_1',
  rte_app_number: '',
  admission_class: '',
  section: '',
  board: 'CBSE',
  full_name: '',
  dob: '',
  gender: 'Male',
  adhar_number: '',
  pen: '',
  apaar_id: '',
  mobile: '',
  alternate_mobile: '',
  email: '',
  father_name: '',
  father_qualification: '',
  father_occupation: '',
  father_adhar: '',
  mother_name: '',
  mother_qualification: '',
  mother_occupation: '',
  mother_adhar: '',
  residential_area: 'Urban',
  house_number: '',
  ward_number: '',
  colony_area: '',
  city_village: '',
  block: '',
  tehsil: '',
  district: '',
  state: '',
  pincode: '',
  previous_session: '',
  previous_class: '',
  previous_scholar_number: '',
  previous_school_name: '',
  previous_result: '',
  previous_grade: '',
  previous_attendance: '',
  vehicle_service: 'no',
  vehicle_route: '',
  vehicle_period: 'Monthly',
  vehicle_start_date: '',
  vehicle_end_date: '',
  vehicle_months: '',
  vehicle_fee_total: '',
  vehicle_fee_discount: '',
  vehicle_fee_payable: '',
  admission_fee: '',
  tuition_fee: '',
};

export default function Admissions() {
  const [form, setForm] = useState(initialForm);
  const [activeSection, setActiveSection] = useState('admission_info');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [feeMatrix, setFeeMatrix] = useState([]);

  const sectionTabs = [
    { id: 'admission_info', icon: 'bi-person-badge', label: 'Admission Info' },
    { id: 'student_details', icon: 'bi-person', label: 'Student Details' },
    { id: 'parent_details', icon: 'bi-people', label: 'Parents' },
    { id: 'address_contact', icon: 'bi-geo-alt', label: 'Address' },
    { id: 'previous_education', icon: 'bi-book', label: 'Previous School' },
    { id: 'vehicle_fees', icon: 'bi-bus-front', label: 'Bus & Fees' },
  ];

  useEffect(() => {
    async function loadMatrix() {
      try {
        const rows = await fetchJson('/api/fee-matrix');
        setFeeMatrix(rows);
      } catch (err) {
        console.warn('Fee matrix load failed:', err.message);
      }
    }

    loadMatrix();
  }, []);

  useEffect(() => {
    async function generateAdmissionNumber() {
      if (form.admission_number) return;

      try {
        const students = await fetchJson('/api/students');
        const year = form.admission_date ? new Date(form.admission_date).getFullYear() : new Date().getFullYear();
        const matches = (students || [])
          .map((student) => String(student.admission_number || student.reg_no || ''))
          .map((value) => {
            const numericMatch = value.match(/(\d+)$/);
            return numericMatch ? Number(numericMatch[1]) : null;
          })
          .filter((value) => Number.isFinite(value));

        const nextNumber = matches.length ? Math.max(...matches) + 1 : 1;
        update('admission_number', `SGS-${year}-${String(nextNumber).padStart(3, '0')}`);
      } catch (err) {
        const fallbackYear = form.admission_date ? new Date(form.admission_date).getFullYear() : new Date().getFullYear();
        update('admission_number', `SGS-${fallbackYear}-001`);
      }
    }

    generateAdmissionNumber();
  }, [form.admission_date]);

  useEffect(() => {
    if (!form.admission_class || !form.board) return;

    const numericClass = String(form.admission_class).replace(/[^0-9]/g, '');
    const matched = feeMatrix.find(
      (row) =>
        String(row.class) === String(numericClass) &&
        String(row.board).toLowerCase() === String(form.board).toLowerCase(),
    );

    if (matched) {
      setForm((prev) => ({
        ...prev,
        tuition_fee: String(matched.tuition_fee || ''),
        admission_fee: String(Math.round(Number(matched.tuition_fee || 0) * 0.12) || ''),
      }));
    }
  }, [form.admission_class, form.board, feeMatrix]);

  useEffect(() => {
    const total = Number(form.vehicle_fee_total || 0);
    const discount = Number(form.vehicle_fee_discount || 0);
    setForm((prev) => ({
      ...prev,
      vehicle_fee_payable: String(Math.max(0, total - discount)),
    }));
  }, [form.vehicle_fee_total, form.vehicle_fee_discount]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setActiveSection('admission_info');
    setError(null);
    setResult(null);
  }

  function goToSection(direction) {
    const currentIndex = sectionTabs.findIndex((tab) => tab.id === activeSection);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < sectionTabs.length) {
      setActiveSection(sectionTabs[nextIndex].id);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    const payload = {
      reg_no: form.admission_number || undefined,
      name: form.full_name,
      class: form.admission_class,
      board: form.board,
      father_name: form.father_name,
      phone: form.mobile,
      email: form.email,
      admission_number: form.admission_number,
      admission_date: form.admission_date,
      admission_year: form.previous_session,
      category: form.admission_type,
      section: form.section,
    };

    try {
      const res = await fetch(`${API_BASE}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || res.statusText);
      }

      const json = await res.json();
      setResult(json);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell p-3 bg-white rounded shadow-sm">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h4 className="mb-1">Student Admissions</h4>
          <p className="text-muted mb-0">Use the icons below to switch between separate admission sections.</p>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
          Reset
        </button>
      </div>

      <div className="card card-body mb-4 shadow-sm">
        <div className="d-flex flex-wrap gap-2 mb-3">
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${
                activeSection === tab.id ? 'btn-primary text-white' : 'btn-outline-secondary'
              }`}
              onClick={() => setActiveSection(tab.id)}
            >
              <i className={`bi ${tab.icon} me-2`} />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {activeSection === 'admission_info' && (
            <>
              <h5 className="mb-3">Admission Information</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Admission Number</label>
                  <input
                    className="form-control"
                    value={form.admission_number}
                    readOnly
                    placeholder="SGS-2025-001"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Admission Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.admission_date}
                    onChange={(e) => update('admission_date', e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Admission Type</label>
                  <select
                    className="form-select"
                    value={form.admission_type}
                    onChange={(e) => update('admission_type', e.target.value)}
                  >
                    {admissionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">RTE Application Number</label>
                  <input
                    className="form-control"
                    value={form.rte_app_number}
                    onChange={(e) => update('rte_app_number', e.target.value)}
                    placeholder="RTE-2026-1234"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Admission Class</label>
                  <select
                    className="form-select"
                    value={form.admission_class}
                    onChange={(e) => update('admission_class', e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {classOptions.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Board</label>
                  <select
                    className="form-select"
                    value={form.board}
                    onChange={(e) => update('board', e.target.value)}
                  >
                    {boardOptions.map((board) => (
                      <option key={board} value={board}>
                        {board}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Section</label>
                  <input
                    className="form-control"
                    value={form.section}
                    onChange={(e) => update('section', e.target.value)}
                    placeholder="A"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Admission Fee</label>
                  <input
                    className="form-control"
                    value={form.admission_fee}
                    onChange={(e) => update('admission_fee', e.target.value)}
                    placeholder="Admission fee"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tuition Fee</label>
                  <input
                    className="form-control"
                    value={form.tuition_fee}
                    onChange={(e) => update('tuition_fee', e.target.value)}
                    placeholder="Tuition fee"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Total School Fee</label>
                  <input
                    className="form-control"
                    value={String(Number(form.admission_fee || 0) + Number(form.tuition_fee || 0))}
                    readOnly
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === 'student_details' && (
            <>
              <h5 className="mb-3">Student Details</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-control"
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    placeholder="Student full name"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.dob}
                    onChange={(e) => update('dob', e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={form.gender}
                    onChange={(e) => update('gender', e.target.value)}
                  >
                    {genderOptions.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Aadhaar Number</label>
                  <input
                    className="form-control"
                    value={form.adhar_number}
                    onChange={(e) => update('adhar_number', e.target.value)}
                    placeholder="0000-0000-0000"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">PEN (UDISE)</label>
                  <input
                    className="form-control"
                    value={form.pen}
                    onChange={(e) => update('pen', e.target.value)}
                    placeholder="PEN number"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">APAAR ID</label>
                  <input
                    className="form-control"
                    value={form.apaar_id}
                    onChange={(e) => update('apaar_id', e.target.value)}
                    placeholder="APAAR ID"
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === 'parent_details' && (
            <>
              <h5 className="mb-3">Parent / Guardian Details</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Father's Name</label>
                  <input
                    className="form-control"
                    value={form.father_name}
                    onChange={(e) => update('father_name', e.target.value)}
                    placeholder="Father's name"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Father's Qualification</label>
                  <input
                    className="form-control"
                    value={form.father_qualification}
                    onChange={(e) => update('father_qualification', e.target.value)}
                    placeholder="Qualification"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Father's Occupation</label>
                  <input
                    className="form-control"
                    value={form.father_occupation}
                    onChange={(e) => update('father_occupation', e.target.value)}
                    placeholder="Occupation"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Mother's Name</label>
                  <input
                    className="form-control"
                    value={form.mother_name}
                    onChange={(e) => update('mother_name', e.target.value)}
                    placeholder="Mother's name"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Mother's Qualification</label>
                  <input
                    className="form-control"
                    value={form.mother_qualification}
                    onChange={(e) => update('mother_qualification', e.target.value)}
                    placeholder="Qualification"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Mother's Occupation</label>
                  <input
                    className="form-control"
                    value={form.mother_occupation}
                    onChange={(e) => update('mother_occupation', e.target.value)}
                    placeholder="Occupation"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Father Aadhaar Number</label>
                  <input
                    className="form-control"
                    value={form.father_adhar}
                    onChange={(e) => update('father_adhar', e.target.value)}
                    placeholder="Father Aadhaar"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Mother Aadhaar Number</label>
                  <input
                    className="form-control"
                    value={form.mother_adhar}
                    onChange={(e) => update('mother_adhar', e.target.value)}
                    placeholder="Mother Aadhaar"
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === 'address_contact' && (
            <>
              <h5 className="mb-3">Address & Contact</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="form-control"
                    value={form.mobile}
                    onChange={(e) => update('mobile', e.target.value)}
                    placeholder="Primary mobile"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Alternate Mobile</label>
                  <input
                    className="form-control"
                    value={form.alternate_mobile}
                    onChange={(e) => update('alternate_mobile', e.target.value)}
                    placeholder="Alternate mobile"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email ID</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="Email address"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Residential Area</label>
                  <select
                    className="form-select"
                    value={form.residential_area}
                    onChange={(e) => update('residential_area', e.target.value)}
                  >
                    {residentialOptions.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">House Number</label>
                  <input
                    className="form-control"
                    value={form.house_number}
                    onChange={(e) => update('house_number', e.target.value)}
                    placeholder="House number"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Ward Number</label>
                  <input
                    className="form-control"
                    value={form.ward_number}
                    onChange={(e) => update('ward_number', e.target.value)}
                    placeholder="Ward number"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Area / Colony</label>
                  <input
                    className="form-control"
                    value={form.colony_area}
                    onChange={(e) => update('colony_area', e.target.value)}
                    placeholder="Area or colony"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">City / Village</label>
                  <input
                    className="form-control"
                    value={form.city_village}
                    onChange={(e) => update('city_village', e.target.value)}
                    placeholder="City or village"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Block</label>
                  <input
                    className="form-control"
                    value={form.block}
                    onChange={(e) => update('block', e.target.value)}
                    placeholder="Block"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tehsil</label>
                  <input
                    className="form-control"
                    value={form.tehsil}
                    onChange={(e) => update('tehsil', e.target.value)}
                    placeholder="Tehsil"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">District</label>
                  <input
                    className="form-control"
                    value={form.district}
                    onChange={(e) => update('district', e.target.value)}
                    placeholder="District"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">State</label>
                  <input
                    className="form-control"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">PIN Code</label>
                  <input
                    className="form-control"
                    value={form.pincode}
                    onChange={(e) => update('pincode', e.target.value)}
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === 'previous_education' && (
            <>
              <h5 className="mb-3">Previous Education</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Previous Session</label>
                  <input
                    className="form-control"
                    value={form.previous_session}
                    onChange={(e) => update('previous_session', e.target.value)}
                    placeholder="2025-26"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Previous Class</label>
                  <input
                    className="form-control"
                    value={form.previous_class}
                    onChange={(e) => update('previous_class', e.target.value)}
                    placeholder="Class 7"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Scholar Number</label>
                  <input
                    className="form-control"
                    value={form.previous_scholar_number}
                    onChange={(e) => update('previous_scholar_number', e.target.value)}
                    placeholder="Scholar number"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Previous School Name</label>
                  <input
                    className="form-control"
                    value={form.previous_school_name}
                    onChange={(e) => update('previous_school_name', e.target.value)}
                    placeholder="School name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Result / Grade</label>
                  <input
                    className="form-control"
                    value={form.previous_result}
                    onChange={(e) => update('previous_result', e.target.value)}
                    placeholder="Result or grade"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Percentage / Grade</label>
                  <input
                    className="form-control"
                    value={form.previous_grade}
                    onChange={(e) => update('previous_grade', e.target.value)}
                    placeholder="% or grade"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Attendance</label>
                  <input
                    className="form-control"
                    value={form.previous_attendance}
                    onChange={(e) => update('previous_attendance', e.target.value)}
                    placeholder="Attendance %"
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === 'vehicle_fees' && (
            <>
              <h5 className="mb-3">Vehicle & Fees</h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Vehicle Facility</label>
                  <select
                    className="form-select"
                    value={form.vehicle_service}
                    onChange={(e) => update('vehicle_service', e.target.value)}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                {form.vehicle_service === 'yes' && (
                  <>
                    <div className="col-md-3">
                      <label className="form-label">Vehicle Route</label>
                      <input
                        className="form-control"
                        value={form.vehicle_route}
                        onChange={(e) => update('vehicle_route', e.target.value)}
                        placeholder="Route name"
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Vehicle Period</label>
                      <select
                        className="form-select"
                        value={form.vehicle_period}
                        onChange={(e) => update('vehicle_period', e.target.value)}
                      >
                        <option>Monthly</option>
                        <option>Quarterly</option>
                        <option>Yearly</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.vehicle_start_date}
                        onChange={(e) => update('vehicle_start_date', e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.vehicle_end_date}
                        onChange={(e) => update('vehicle_end_date', e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Total Months</label>
                      <input
                        className="form-control"
                        value={form.vehicle_months}
                        onChange={(e) => update('vehicle_months', e.target.value)}
                        placeholder="Months"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Vehicle Fee Total</label>
                      <input
                        className="form-control"
                        value={form.vehicle_fee_total}
                        onChange={(e) => update('vehicle_fee_total', e.target.value)}
                        placeholder="Total fee"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Vehicle Discount</label>
                      <input
                        className="form-control"
                        value={form.vehicle_fee_discount}
                        onChange={(e) => update('vehicle_fee_discount', e.target.value)}
                        placeholder="Discount"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Vehicle Payable</label>
                      <input
                        className="form-control"
                        value={form.vehicle_fee_payable}
                        readOnly
                        placeholder="Payable amount"
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mt-4 pt-3 border-top">
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline-primary" onClick={() => goToSection('prev')} disabled={activeSection === sectionTabs[0].id}>
                Previous
              </button>
              <button type="button" className="btn btn-outline-primary" onClick={() => goToSection('next')} disabled={activeSection === sectionTabs[sectionTabs.length - 1].id}>
                Next
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Save Admission'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                Reset
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger mt-4">{error}</div>}
          {result && (
            <div className="alert alert-success mt-4">
              Admission saved successfully. Registration No:{' '}
              <strong>{result.reg_no}</strong>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
