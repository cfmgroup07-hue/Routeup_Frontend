import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import {
  STUDY_ABROAD_COUNTRIES,
  STUDY_ABROAD_COUNTRY_EXTRAS,
  STUDY_ABROAD_FINANCIAL_NOTES,
  STUDY_ABROAD_FINANCIAL_WHY,
  STUDY_ABROAD_STRATEGY_WHY,
  STUDY_ABROAD_WHY_SECTIONS,
} from '../data/studyAbroadData';

const StudyAbroadWhyDocuments = () => {
  const [country, setCountry] = useState('');

  return (
    <div className="pr-page">
      <SiteNavbar active="study-abroad" />

      <section className="pr-hero">
        <div className="pr-hero-badge">Study Abroad — Reference Guide</div>
        <h1>
          Why these documents,
          <br />
          <span className="green">and how much money</span> you actually need.
        </h1>
        <p>
          A plain-English explanation of what each document is checked for, and what financial proof
          looks like for each destination.
        </p>
        <div className="pr-disclaimer">
          <strong>Note:</strong> Figures below reflect current published guidance where we could
          verify it directly (Germany, Australia, New Zealand, Switzerland). For Singapore, Poland,
          Italy, UAE, and the USA, numbers vary by source or aren&apos;t set nationally — we&apos;ve said so
          rather than guessing. Always confirm the exact current figure with the consulate or your
          university before finalising funds.
        </div>
      </section>

      <section className="pr-section">
        <div className="pr-container">
          {STUDY_ABROAD_WHY_SECTIONS.map((section) => (
            <div className="pr-card" key={section.title}>
              <p className="pr-label" style={{ color: '#0d7c3d', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: 13 }}>
                {section.title}
              </p>
              {section.items.map((item) => (
                <div className="pr-gap-block" key={item.name} style={{ padding: '14px 0' }}>
                  <h4 style={{ marginBottom: 4 }}>{item.name}</h4>
                  <p>{item.why}</p>
                </div>
              ))}
            </div>
          ))}

          <div className="pr-card">
            <p className="pr-label" style={{ color: '#0d7c3d', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: 13 }}>
              Financial &amp; sponsorship documents
            </p>
            {STUDY_ABROAD_FINANCIAL_WHY.map((item) => (
              <div className="pr-gap-block" key={item.name} style={{ padding: '14px 0' }}>
                <h4 style={{ marginBottom: 4 }}>{item.name}</h4>
                <p>{item.why}</p>
              </div>
            ))}

            <div style={{ marginTop: 20 }}>
              <label className="pr-label" style={{ display: 'block', marginBottom: 8 }}>
                See financial proof requirements for:
              </label>
              <select
                className="pr-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select a destination</option>
                {STUDY_ABROAD_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {country && STUDY_ABROAD_FINANCIAL_NOTES[country] && (
              <div
                style={{
                  marginTop: 16,
                  background: '#f0faf4',
                  border: '1px solid #c8e6c9',
                  borderRadius: 10,
                  padding: '16px 20px',
                  fontSize: 13,
                  color: '#35513a',
                  lineHeight: 1.75,
                }}
              >
                <strong style={{ color: '#0d7c3d' }}>{country} financial proof:</strong>{' '}
                {STUDY_ABROAD_FINANCIAL_NOTES[country]}
              </div>
            )}
          </div>

          {country && STUDY_ABROAD_COUNTRY_EXTRAS[country] && (
            <div className="pr-card">
              <p className="pr-label" style={{ color: '#0d7c3d', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: 13 }}>
                {country} — additional documents
              </p>
              {STUDY_ABROAD_COUNTRY_EXTRAS[country].map((item) => (
                <div className="pr-gap-block" key={item.name} style={{ padding: '14px 0' }}>
                  <h4 style={{ marginBottom: 4 }}>{item.name}</h4>
                  <p>{item.why}</p>
                </div>
              ))}
            </div>
          )}

          <div className="pr-card">
            <p className="pr-label" style={{ color: '#0d7c3d', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: 13 }}>
              Application strategy documents
            </p>
            {STUDY_ABROAD_STRATEGY_WHY.map((item) => (
              <div className="pr-gap-block" key={item.name} style={{ padding: '14px 0' }}>
                <h4 style={{ marginBottom: 4 }}>{item.name}</h4>
                <p>{item.why}</p>
              </div>
            ))}
          </div>

          <div
            className="pr-card"
            style={{
              textAlign: 'center',
              background: '#f0faf4',
              border: '2px dashed #0d7c3d',
            }}
          >
            <h3 className="pr-card-title" style={{ color: '#0d7c3d', fontSize: 18 }}>
              Ready to start your application?
            </h3>
            <p style={{ color: '#555', lineHeight: 1.7, marginBottom: 16 }}>
              Upload your documents against the full checklist, or talk it through with our team first.
            </p>
            <Link
              to="/study-abroad-documents"
              className="pr-submit-btn"
              style={{ display: 'inline-block', textDecoration: 'none', maxWidth: 360 }}
            >
              Go to the document checklist →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default StudyAbroadWhyDocuments;
