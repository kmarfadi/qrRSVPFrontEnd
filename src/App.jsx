import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import QRScanner from './components/QRScanner';
import QRGenerator from './components/QRGenerator';

export const StatusContext = createContext();

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon f7 f6-ns">🔒</span>
          <span className="brand-text f7 f6-ns">MARFS QR RSVP V1.2</span>
        </Link>
        <div className="navbar-links">
          <Link 
            to="/scanner" 
            className={`navbar-link ${isActive('/scanner') ? 'active' : ''}`}
          >
            <span className="link-icon f7 f6-ns">📱</span>
            <span className="link-text f7 f6-ns">Scanner</span>
          </Link>
          <Link 
            to="/generator" 
            className={`navbar-link ${isActive('/generator') ? 'active' : ''}`}
          >
            <span className="link-icon f7 f6-ns">🎨</span>
            <span className="link-text f7 f6-ns">Generator</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  const [status, setStatus] = useState(null);

  return (
    <StatusContext.Provider value={{ status, setStatus }}>
      <Router>
        <div className={`app-container ${status ? `status-${status.type}` : ''}`}>
          <Navbar />
          <Routes>
            <Route path="/scanner" element={<QRScanner />} />
            <Route path="/generator" element={<QRGenerator />} />
            <Route path="/" element={<QRScanner />} />
          </Routes>
        </div>
      </Router>
    </StatusContext.Provider>
  );
};

export default App;