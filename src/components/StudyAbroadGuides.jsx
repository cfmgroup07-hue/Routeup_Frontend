import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import { STUDY_ABROAD_GUIDE_VOLUMES } from '../data/studyAbroadGuides';
import './StudyAbroadGuides.css';

const StudyAbroadGuides = () => {
  const navigate = useNavigate();
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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
      <SiteNavbar active="study-abroad-guides" />

      <section className="guides-hero" id="guides">
        <div className="guides-hero-badge">Free · No Email Required · No Sales Calls</div>

        <h1>
          The Study Abroad Guides Every Student &amp; Parent
          <br />
          <span className="accent">Should Read Before Applying</span>
        </h1>

        <p className="guides-hero-sub">
          A free 10-volume series for Indian students and parents — real refusal rates, real living
          costs, real PR rules, and the scam tactics to avoid. Written by an advisor living abroad,
          verified against official government sources, and updated for 2026.
        </p>

        <div className="guides-hero-actions">
          <a href="#volumes" className="guides-btn-primary" onClick={scrollToVolumes}>
            Download the Guides ↓
          </a>
          <button type="button" className="guides-btn-secondary" onClick={goBookSession}>
            Book a Session
          </button>
        </div>

        <p className="guides-trust-bar">
          Every figure verified on official government sources · <b>GOV.UK</b> ·{' '}
          <b>homeaffairs.gov.au</b> · <b>travel.state.gov</b> · <b>immigration.govt.nz</b> · Last
          verified: July 2026
        </p>
      </section>

      <section className="guides-volumes" id="volumes">
        <div className="guides-vol-head">
          <h2>The 10-Volume Series</h2>
          <p>
            Read in order, or jump to where you are in the journey. Every volume is free — no email,
            no sign-up.
          </p>
        </div>

        <div className="guides-vol-grid">
          {STUDY_ABROAD_GUIDE_VOLUMES.map((vol) => (
            <article
              key={vol.volume}
              className={`guides-vol-card${vol.featured ? ' featured' : ''}`}
            >
              <div className="guides-vol-num">
                {vol.featured ? '★ ' : '📖 '}
                {vol.num}
              </div>
              <h3>{vol.title}</h3>
              <p>{vol.blurb}</p>
              <div className="guides-vol-links">
                <button
                  type="button"
                  className="guides-link-read"
                  onClick={() => setViewer(vol)}
                >
                  Read Online
                </button>
                <a
                  className="guides-link-pdf"
                  href={vol.downloadUrl}
                  download={vol.downloadName}
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
          These guides are free, forever. If anyone ever sells you these documents, that itself is a
          red flag.
        </p>

        <div className="guides-vol-cta">
          <p>Ready to talk through your options?</p>
          <Link to="/study-abroad-documents" className="guides-btn-primary">
            Apply for study abroad
          </Link>
        </div>
      </section>

      {viewer && (
        <div className="guides-viewer-overlay" role="dialog" aria-modal="true" aria-label={viewer.title}>
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

export default StudyAbroadGuides;
