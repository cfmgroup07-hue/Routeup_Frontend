import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SiteNavbar = ({ active = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const goHomeSection = (hash) => {
    const id = hash.replace('#', '');
    if (isHome) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate({ pathname: '/', hash: id });
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo-container" style={{ textDecoration: 'none' }}>
        <img src="/Routeup Logo.png" alt="RouteUp Logo" style={{ height: '44px', objectFit: 'contain' }} />
      </Link>
      <div className="nav-links">
        <button type="button" onClick={() => goHomeSection('#about')}>About Us</button>
        <button type="button" onClick={() => goHomeSection('#services')}>Services</button>
        <button type="button" onClick={() => goHomeSection('#education')}>Visa Guide</button>
        <Link to="/apply-australia-pr" className={active === 'australia-pr' ? 'nav-active' : ''}>
          Apply Australia PR
        </Link>
        <button type="button" onClick={() => goHomeSection('#awareness')}>Scam Alerts</button>
        <button
          type="button"
          className="nav-cta"
          onClick={() => goHomeSection('#book')}
        >
          Book Session
        </button>
      </div>
    </nav>
  );
};

export default SiteNavbar;
