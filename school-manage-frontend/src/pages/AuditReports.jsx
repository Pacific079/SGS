import React from 'react';

export default function AuditReports() {
  return (
    <div className="page-shell p-3 bg-white rounded shadow-sm">
      <h4 className="mb-3">Audit Reports</h4>
      <div className="card card-body text-center py-5 shadow-sm">
        <div className="text-muted mb-2">No audit reports available.</div>
        <p className="mb-0">Audit report exports and ledgers appear here once the backend captures payment and student activity.</p>
      </div>
    </div>
  );
}
