import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import { VISA_FREE_GUIDES } from '../data/visaFreeGuides';
import './StudyAbroadGuides.css';

const VisaFreeGuides = () => {
  const navigate = useNavigate();
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Free Visa Guides | RouteUp';
    return () => {
      document.title = 'RouteUp';
    };
  }, []);

  useEffect(() => {
    if (!viewer) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setViewer(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [viewer]);

  const scrollToVolumes = (e) => {
    e.preventDefault();
    document.getElementById('volumes')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goBookSession = (e) => {
    e.preventDefault();
    navigate('/', { hash: 'book' });
    setTimeout(() => {
      document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="guides-page">
      <SiteNavbar active="visa-free-guides" />

      <section className="guides-hero" id="guides">
        <div className="guides-hero-badge">Free · No Email Required · No Sales Calls</div>

        <h1>
          Free Visa Guides for Holidays
          <br />
          <span className="accent">&amp; Ballot Applications</span>
        </h1>

        <p className="guides-hero-sub">
          Download the AU/NZ holidays visa factsheet and the UK ballot visa application guide —
          clear, practical PDFs you can read online or save for later. No sign-up required.
        </p>

        <div className="guides-hero-actions">
          <a href="#volumes" className="guides-btn-primary" onClick={scrollToVolumes}>
            View the Guides ↓
          </a>
          <button type="button" className="guides-btn-secondary" onClick={goBookSession}>
            Book a Session
          </button>
        </div>

        <p className="guides-trust-bar">
          Always verify current rules on official sources · <b>gov.uk</b> ·{' '}
          <b>homeaffairs.gov.au</b> · <b>immigration.govt.nz</b>
        </p>
      </section>

      <section className="guides-volumes" id="volumes">
        <div className="guides-vol-head">
          <h2>Free Visa Guides</h2>
          <p>Read online or download the PDF. Both guides are free — no email, no sign-up.</p>
        </div>

        <div className="guides-vol-grid">
          {VISA_FREE_GUIDES.map((guide) => (
            <article
              key={guide.id}
              className={`guides-vol-card${guide.featured ? ' featured' : ''}`}
            >
              <div className="guides-vol-num">
                {guide.featured ? '★ ' : '📄 '}
                {guide.num}
              </div>
              <h3>{guide.title}</h3>
              <p>{guide.blurb}</p>
              <div className="guides-vol-links">
                <button
                  type="button"
                  className="guides-link-read"
                  onClick={() => setViewer(guide)}
                >
                  Read Online
                </button>
                <a
                  className="guides-link-pdf"
                  href={guide.downloadUrl}
                  download={guide.downloadName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              </div>
            </article>
          ))}
        </div>

        <p className="guides-vol-note">
          Rules and fees change. Always confirm details on the official government website before
          you apply.
        </p>

        <div className="guides-vol-cta">
          <p>Want the scam side of ballot visas explained clearly?</p>
          <Link to="/ballot-visa-awareness" className="guides-btn-primary">
            Ballot Visa Awareness
          </Link>
        </div>
      </section>

      {viewer && (
        <div
          className="guides-viewer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={viewer.title}
        >
          <div className="guides-viewer-panel">
            <div className="guides-viewer-header">
              <div>
                <div className="guides-viewer-kicker">{viewer.num}</div>
                <h3>{viewer.title}</h3>
              </div>
              <div className="guides-viewer-actions">
                <a
                  className="guides-link-pdf"
                  href={viewer.downloadUrl}
                  download={viewer.downloadName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
                <button
                  type="button"
                  className="guides-viewer-close"
                  aria-label="Close reader"
                  onClick={() => setViewer(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <iframe
              title={viewer.title}
              src={`${viewer.viewUrl}#toolbar=0&navpanes=0`}
              className="guides-viewer-frame"
            />
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
};

export default VisaFreeGuides;
