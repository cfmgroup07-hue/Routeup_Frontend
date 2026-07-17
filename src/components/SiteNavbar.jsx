import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const SiteNavbar = ({ active = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const goHomeSection = (hash) => {
    closeMenu();
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
      <Link to="/" className="logo-container" style={{ textDecoration: 'none' }} onClick={closeMenu}>
        <img src="/Routeup Logo.png" alt="RouteUp Logo" style={{ height: '44px', objectFit: 'contain' }} />
      </Link>

      <button
        type="button"
        className="nav-toggle"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`nav-links${menuOpen ? ' open' : ''}`}>
        <button type="button" onClick={() => goHomeSection('#about')}>About Us</button>
        <button type="button" onClick={() => goHomeSection('#services')}>Services</button>
        <button type="button" onClick={() => goHomeSection('#education')}>Visa Guide</button>
        <Link
          to="/study-abroad-documents"
          className={active === 'study-abroad' ? 'nav-active' : ''}
          onClick={closeMenu}
        >
          Study Abroad
        </Link>
        <Link
          to="/apply-australia-pr"
          className={active === 'australia-pr' ? 'nav-active' : ''}
          onClick={closeMenu}
        >
          Apply Australia PR
        </Link>
        <Link
          to="/ballot-visa-awareness"
          className={active === 'ballot-awareness' ? 'nav-active' : ''}
          onClick={closeMenu}
        >
          Ballot Visa Awareness
        </Link>
        <button type="button" onClick={() => goHomeSection('#awareness')}>Scam Alerts</button>
        <button type="button" className="nav-cta" onClick={() => goHomeSection('#book')}>
          Book Session
        </button>
      </div>

      {menuOpen && <button type="button" className="nav-backdrop" aria-label="Close menu" onClick={closeMenu} />}
    </nav>
  );
};

export default SiteNavbar;
