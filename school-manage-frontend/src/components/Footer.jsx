import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer mt-4 px-4 py-3 bg-white rounded shadow-sm">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="text-muted small">Last activity: —</div>
        <div className="text-muted small">
          <span className="me-3"><i className="bi bi-file-earmark-text"></i> frontend.pdf</span>
          <span><i className="bi bi-layers"></i> page 8 / 25</span>
        </div>
      </div>
    </footer>
  );
}
