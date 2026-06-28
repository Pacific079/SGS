import React from 'react';

const tabs = [
  { id: 'dashboard', label: 'Admin Dashboard', icon: 'bi-grid-1x2-fill' },
  { id: 'admissions', label: 'Student Admissions', icon: 'bi-person-plus' },
  { id: 'fee', label: 'Fee Collection', icon: 'bi-cash-coin' },
  { id: 'carry', label: 'Carry Forward', icon: 'bi-arrow-left-right' },
  { id: 'matrix', label: 'Fee Matrix', icon: 'bi-layout-three-columns' },
  { id: 'fleet', label: 'Fleet & Bus', icon: 'bi-bus-front' },
  { id: 'audit', label: 'Audit Reports', icon: 'bi-clipboard-data' },
];

export default function Sidebar({ active, onChange, sidebarOpen, setSidebarOpen }) {
  return (
    <nav className={`sidebar bg-dark text-white ${sidebarOpen ? 'show' : ''}`}>
      <div className="sidebar-brand px-4 py-3 border-bottom border-white-10">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-diagram-3 fs-4 text-info"></i>
          <div>
            <div className="fw-bold">EduFlow</div>
            <div className="small text-muted">SGI Panhala</div>
          </div>
        </div>
      </div>
      <div className="sidebar-links px-3 py-3 d-flex flex-column gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn btn-outline-light text-start rounded-pill ${active === tab.id ? 'active' : 'opacity-75'}`}
            onClick={() => {
              onChange(tab.id);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          >
            <i className={`bi ${tab.icon} me-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="sidebar-footer px-4 mt-auto pb-4 pt-3 border-top border-white-10">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>AP</div>
          <div>
            <div className="small fw-semibold">Admin Portal</div>
            <div className="small text-muted">sgi@panhala.edu</div>
          </div>
        </div>
        <button className="btn btn-outline-danger w-100" onClick={() => onChange('login')}>
          Logout
        </button>
      </div>
    </nav>
  );
}
