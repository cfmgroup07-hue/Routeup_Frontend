import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SiteFooter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const goHomeSection = (e, hash) => {
    e.preventDefault();
    const id = hash.replace('#', '');
    if (isHome) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleAdminDoubleClick = () => {
    window.location.href = '/admin';
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <img src="/Routeup Logo.png" alt="RouteUp Logo" style={{ height: '44px', objectFit: 'contain' }} />
        </div>
        <p className="footer-tagline">Career Advisory &amp; Migration Guidance</p>
        
        <div className="footer-links">
          <a href="#about" onClick={(e) => goHomeSection(e, '#about')}>About Us</a>
          <a href="#services" onClick={(e) => goHomeSection(e, '#services')}>Services</a>
          <a href="#education" onClick={(e) => goHomeSection(e, '#education')}>Visa Guide</a>
          <Link to="/study-abroad-documents">Study Abroad</Link>
          <Link to="/apply-australia-pr">Apply Australia PR</Link>
          <Link to="/ballot-visa-awareness">Ballot Visa Awareness</Link>
          <a href="#awareness" onClick={(e) => goHomeSection(e, '#awareness')}>Scam Alerts</a>
          <a href="#book" onClick={(e) => goHomeSection(e, '#book')} style={{ color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Book Session</a>
        </div>

        <div className="footer-contact">
          <p>
            <span onDoubleClick={handleAdminDoubleClick} style={{ cursor: 'pointer', userSelect: 'none' }}>Questions?</span> 
            {' '}Reach us at <a href="mailto:hello@routeup.co.in">hello@routeup.co.in</a>
          </p>
        </div>
        
        <p className="footer-bottom">© 2026 RouteUp. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default SiteFooter;
