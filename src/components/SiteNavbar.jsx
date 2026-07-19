import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';

const STUDY_ABROAD_LINKS = [
  { to: '/study-abroad-documents', label: 'Upload Documents', activeKey: 'study-abroad' },
  { to: '/study-abroad-guides', label: 'Free Guides', activeKey: 'study-abroad-guides' },
  { to: '/study-abroad-why-documents', label: 'Why Documents Matter', activeKey: 'study-abroad-why' },
];

const SiteNavbar = ({ active = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [studyOpen, setStudyOpen] = useState(false);
  const studyRef = useRef(null);

  const studyActive = STUDY_ABROAD_LINKS.some((item) => item.activeKey === active);

  useEffect(() => {
    setMenuOpen(false);
    setStudyOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!studyOpen) return undefined;

    const onPointerDown = (event) => {
      if (studyRef.current && !studyRef.current.contains(event.target)) {
        setStudyOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [studyOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setStudyOpen(false);
  };

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

        <div
          className={`nav-dropdown${studyOpen ? ' open' : ''}${studyActive ? ' active' : ''}`}
          ref={studyRef}
        >
          <button
            type="button"
            className={`nav-dropdown-trigger${studyActive ? ' nav-active' : ''}`}
            aria-expanded={studyOpen}
            aria-haspopup="true"
            onClick={() => setStudyOpen((open) => !open)}
          >
            Study Abroad
            <ChevronDown size={16} className={`nav-dropdown-chevron${studyOpen ? ' open' : ''}`} />
          </button>
          <div className="nav-dropdown-menu">
            {STUDY_ABROAD_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={active === item.activeKey ? 'nav-active' : ''}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

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
