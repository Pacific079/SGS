import React from 'react';

export default function TopHeader() {
  return (
    <header className="top-header bg-white rounded-pill p-2 mb-3 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-2">
        <span className="fw-bold">SGI Panhala</span>
      </div>
      <div className="d-flex align-items-center gap-3">
        <div className="year-selector bg-light rounded-pill px-2 py-1 d-flex align-items-center gap-2">
          <i className="bi bi-calendar3 text-primary"></i>
          <select className="border-0 bg-transparent">
            <option>2026-27</option>
            <option>2025-26</option>
          </select>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle bg-info text-dark d-inline-flex align-items-center justify-content-center" style={{width:34,height:34}}>AP</div>
          <div>
            <div className="fw-semibold small">Admin Portal</div>
            <div className="small text-muted">sgi@panhala.edu</div>
          </div>
        </div>
      </div>
    </header>
  );
}
