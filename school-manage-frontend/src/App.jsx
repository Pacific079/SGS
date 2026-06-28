import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Admissions from './pages/Admissions';
import FeeCollection from './pages/FeeCollection';
import FeeMatrix from './pages/FeeMatrix';
import CarryForward from './pages/CarryForward';
import FleetBus from './pages/FleetBus';
import AuditReports from './pages/AuditReports';
import StudentRecord from './pages/StudentRecord';

const pageMap = {
  dashboard: Dashboard,
  admissions: Admissions,
  fee: FeeCollection,
  matrix: FeeMatrix,
  carry: CarryForward,
  fleet: FleetBus,
  audit: AuditReports,
  record: StudentRecord,
};

const App = () => {
  const [activeTab, setActiveTab] = useState('admissions');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    const Page = pageMap[activeTab] || Admissions;
    return <Page />;
  };

  return (
    <div className="d-flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="main-content">
        <TopHeader />
        {renderContent()}
        <Footer />
      </div>
      <button
        className="btn btn-light d-md-none position-fixed bottom-0 start-0 m-3 rounded-circle shadow mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className="bi bi-list"></i>
      </button>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f0f4f9;
          color: #1a2a3a;
        }
        .main-content {
          flex: 1;
          padding: 1.5rem 2rem 2.5rem 2rem;
          min-height: 100vh;
          margin-left: 250px;
        }
        @media (max-width: 768px) {
          .main-content { margin-left: 0; padding: 1rem; }
        }
        .mobile-toggle {
          width: 48px;
          height: 48px;
          z-index: 1060;
          border: 1px solid #d8e2ed;
        }
      `}</style>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'bi-grid-1x2-fill', label: 'Admin Dashboard' },
    { id: 'admissions', icon: 'bi-person-plus', label: 'Student Admissions' },
    { id: 'record', icon: 'bi-journal-text', label: 'Student Record' },
    { id: 'fee', icon: 'bi-cash-coin', label: 'Fee Collection' },
    { id: 'carry', icon: 'bi-arrow-left-right', label: 'Carry Forward' },
    { id: 'matrix', icon: 'bi-layout-three-columns', label: 'Fee Matrix' },
    { id: 'fleet', icon: 'bi-bus-front', label: 'Fleet & Bus' },
    { id: 'audit', icon: 'bi-clipboard-data', label: 'Audit Reports' },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <nav className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
      <div className="brand">
        <i className="bi bi-diagram-3"></i> EduFlow 
      </div>
      <div className="node-label">
        <i className="bi bi-dot" style={{ color: '#6ec8ff' }}></i> ACTIVE SCHOOL NODE
      </div>
      <div className="school-name">
        <i className="bi bi-building"></i> SGI Panhala
      </div>

      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`nav-link-custom ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => handleTabClick(item.id)}
        >
          <i className={`bi ${item.icon}`}></i> {item.label}
        </button>
      ))}

      <div className="sidebar-footer">
        <div className="admin-profile">
          <span className="avatar-small">AP</span>
          <div>
            <div className="admin-name">Admin Portal</div>
            <div className="admin-email">sgi@panhala.edu</div>
          </div>
        </div>
        <button className="nav-link-custom logout" onClick={() => alert('Logged out successfully!')}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
        <div className="logout-session">LOGOUT SESSION</div>
      </div>

      <style>{`
        .sidebar {
          background: #0a1e33;
          width: 250px;
          min-height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1050;
          padding: 1.8rem 0 1.5rem 0;
          transition: transform 0.25s ease;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .brand {
          color: #fff;
          font-weight: 700;
          font-size: 1.3rem;
          padding: 0 1.5rem 1.5rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .brand i { color: #6ec8ff; margin-right: 10px; }
        .brand span { font-weight: 300; }
        .node-label {
          padding: 1rem 1.5rem 0.2rem 1.5rem;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: rgba(255,255,255,0.35);
        }
        .school-name {
          padding: 0.2rem 1.5rem 1rem 1.5rem;
          color: #fff;
          font-weight: 600;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .school-name i { color: #6ec8ff; margin-right: 10px; }
        .nav-link-custom {
          color: rgba(255,255,255,0.6);
          padding: 0.5rem 1.5rem;
          font-weight: 450;
          font-size: 0.85rem;
          border-left: 3px solid transparent;
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: all 0.12s;
          cursor: pointer;
        }
        .nav-link-custom i { font-size: 1.1rem; width: 22px; text-align: center; }
        .nav-link-custom:hover, .nav-link-custom.active {
          background: rgba(255,255,255,0.05);
          color: #fff;
          border-left-color: #6ec8ff;
        }
        .sidebar-footer {
          margin-top: auto;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 0.8rem;
        }
        .admin-profile {
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          margin-bottom: 0.4rem;
        }
        .avatar-small {
          background: #2e5780;
          width: 32px;
          height: 32px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.8rem;
        }
        .admin-name { font-weight: 500; font-size: 0.85rem; }
        .admin-email { font-size: 0.65rem; color: rgba(255,255,255,0.45); }
        .nav-link-custom.logout { color: rgba(255,255,255,0.3); }
        .nav-link-custom.logout:hover { color: #ff8a8a; background: rgba(255,0,0,0.04); }
        .logout-session {
          font-size: 0.55rem;
          color: rgba(255,255,255,0.06);
          padding: 0.05rem 1.5rem;
          letter-spacing: 0.4px;
        }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.show { transform: translateX(0); }
        }
      `}</style>
    </nav>
  );
};

const TopHeader = () => {
  return (
    <header className="top-header">
      <div className="header-left">
        <span className="school-name-header">SGI Panhala</span>
      </div>
      <div className="user-profile">
        <div className="year-selector">
          <i className="bi bi-calendar3"></i>
          <select>
            <option>2026-27</option>
            <option>2025-26</option>
            <option>2024-25</option>
          </select>
        </div>
        <div className="avatar">AP</div>
        <div className="user-info">
          <div className="user-name">Admin Portal</div>
          <div className="user-email">sgi@panhala.edu</div>
        </div>
        <i className="bi bi-chevron-down chevron"></i>
      </div>

      <style>{`
        .top-header {
          background: #ffffff;
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.8rem;
          border: 1px solid rgba(0,0,0,0.02);
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
        }
        .school-name-header {
          font-weight: 600;
          color: #0a1e33;
          font-size: 1rem;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .year-selector {
          background: #f0f4f9;
          border: 1px solid #e2eaf2;
          border-radius: 50px;
          padding: 0.2rem 0.8rem 0.2rem 1rem;
          font-size: 0.8rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .year-selector select {
          border: none;
          background: transparent;
          font-weight: 600;
          color: #0a1e33;
          font-size: 0.8rem;
          outline: none;
          cursor: pointer;
        }
        .year-selector i { color: #2a7de1; font-size: 0.8rem; }
        .avatar {
          width: 34px;
          height: 34px;
          background: #d4e2fc;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #0a1e33;
          font-size: 0.85rem;
        }
        .user-info { line-height: 1.2; }
        .user-name { font-weight: 500; font-size: 0.85rem; }
        .user-email { font-size: 0.65rem; color: #6f8aa8; }
        .chevron { color: #7a95b2; font-size: 0.8rem; }
        @media (max-width: 768px) {
          .top-header { border-radius: 16px; padding: 0.5rem 1rem; }
          .user-info { display: none; }
        }
      `}</style>
    </header>
  );
};

const Footer = () => {
  return (
    <div className="footer-meta d-flex flex-wrap justify-content-between align-items-center">
      <div>
        <i className="bi bi-clock-history me-2"></i> Last activity: <span className="text-dark">—</span>
      </div>
      <div>
        <span className="me-3"><i className="bi bi-file-pdf"></i> frontend.pdf</span>
        <span><i className="bi bi-layers"></i> page 8 / 25</span>
      </div>
      <style>{`
        .footer-meta {
          font-size: 0.75rem;
          color: #8ba0b9;
          border-top: 1px solid #e2eaf2;
          padding-top: 1rem;
          margin-top: 2rem;
        }
        .text-dark { color: #1a2a3a !important; }
      `}</style>
    </div>
  );
};

export default App;
