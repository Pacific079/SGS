import React from 'react';

export default function CarryForward() {
  return (
    <div className="page-shell p-3 bg-white rounded shadow-sm">
      <h4 className="mb-3">Carry Forward</h4>
      <div className="card card-body text-center py-5 shadow-sm">
        <div className="text-muted mb-2">No carry forward records are available.</div>
        <p className="mb-0">When fee dues or transport fees span multiple cycles, they will appear here for reconciliation.</p>
      </div>
    </div>
  );
}
