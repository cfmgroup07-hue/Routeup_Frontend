import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SiteNavbar from './SiteNavbar';
import { API_URL } from '../config';
import { PR_OCCUPATIONS, findOccupation } from '../data/australiaPrData';

const AustraliaPREligibility = () => {
  const navigate = useNavigate();
  const [occValue, setOccValue] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const occupation = useMemo(() => findOccupation(occValue), [occValue]);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error('Please fill in your name, phone, and email.');
      return;
    }
    if (!occupation) {
      toast.error('Please select your occupation first.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('existingExperience', notes.trim());
      formData.append('occupation', occupation.name);
      formData.append('anzsco', occupation.anzsco);
      formData.append('assessingBody', occupation.body);
      formData.append('source', 'eligibility-check');
      formData.append('documentMeta', JSON.stringify([]));

      const res = await fetch(`${API_URL}/api/pr-leads`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit');
      }

      toast.success('Details saved! Redirecting to book your session...');
      navigate({ pathname: '/', hash: 'book' });
    } catch (error) {
      toast.error(error.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pr-page">
      <SiteNavbar active="australia-pr" />

      <section className="pr-hero">
        <div className="pr-hero-badge">Australia PR — Eligibility Check</div>
        <h1>
          Don&apos;t have your certification<br />
          or assessment records <span className="green">yet?</span>
        </h1>
        <p>
          Select your occupation to see what&apos;s genuinely required and whether an alternate pathway
          exists. This is general information only — it doesn&apos;t tell you whether you personally qualify.
        </p>

        <div className="pr-disclaimer">
          <strong>What this page is and isn&apos;t:</strong> RouteUp does not prepare, write, or lodge
          skills assessment applications (CDRs, RPL reports, reference letters) on anyone&apos;s behalf,
          and we are not a Registered Migration Agent (MARA). This page explains publicly available
          pathway information so you know what to ask about. Your actual eligibility can only be
          confirmed by the assessing body itself or a Registered Migration Agent.
        </div>
      </section>

      <section className="pr-section">
        <div className="pr-container">
          <div className="pr-card">
            <h3 className="pr-card-title">Select your occupation</h3>
            <select
              className="pr-select"
              value={occValue}
              onChange={(e) => setOccValue(e.target.value)}
            >
              <option value="">Select an occupation or trade</option>
              {PR_OCCUPATIONS.map((group, gi) => (
                <optgroup key={group.sector} label={group.sector}>
                  {group.list.map((occ, oi) => (
                    <option key={occ.anzsco} value={`${gi}-${oi}`}>
                      {occ.name} ({occ.anzsco})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {occupation && (
              <div className="pr-occ-info">
                <span className="pr-pill primary">ANZSCO {occupation.anzsco}</span>
                <span className="pr-pill">Assessing body: {occupation.body}</span>
              </div>
            )}
          </div>

          {occupation && (
            <div className="pr-card">
              <div className="pr-gap-block">
                <h4>What&apos;s normally required</h4>
                <p>{occupation.requires}</p>
              </div>
              <div className="pr-gap-block">
                <h4>
                  If you don&apos;t have this yet{' '}
                  <span className={`pr-tag ${occupation.warn ? 'warn' : ''}`}>{occupation.tag}</span>
                </h4>
                <p>{occupation.ifMissing}</p>
              </div>
              <div className="pr-referral">
                <h4>Next step</h4>
                <p>
                  This is general pathway information, not a determination of your eligibility. To
                  confirm what actually applies to your situation, and to prepare or lodge any
                  assessment application, you need {occupation.body} directly or a Registered Migration
                  Agent (search the{' '}
                  <a
                    href="https://portal.mara.gov.au/search-the-register-of-migration-agents/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OMARA register
                  </a>
                  ). RouteUp can talk through your options in a paid advisory session, but we don&apos;t
                  prepare or submit assessment applications ourselves.
                </p>
              </div>
            </div>
          )}

          {occupation && (
            <div className="pr-card">
              <h3 className="pr-card-title">Want to talk it through?</h3>
              <div className="pr-form-row">
                <div className="pr-form-group">
                  <label>Full name <span className="req">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="pr-form-group">
                  <label>Phone / WhatsApp <span className="req">*</span></label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div className="pr-form-group" style={{ marginBottom: 16 }}>
                <label>Email address <span className="req">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="pr-form-group" style={{ marginBottom: 16 }}>
                <label>What experience or training do you already have?</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 5 years as an electrician, no formal trade certificate, trained on the job..."
                />
              </div>
              <button type="button" className="pr-submit-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Book a Visa & Migration session — Rs.2999'}
              </button>
              <p className="pr-secure-note">
                After you submit, our team will connect with you within 24 hours.
              </p>
              <p className="pr-back-link">
                Already have your documents?{' '}
                <Link to="/apply-australia-pr">Go to document upload →</Link>
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="pr-footer">
        <img src="/Routeup Logo.png" alt="RouteUp" className="pr-footer-logo" />
        <p>Career Advisory & Migration Guidance</p>
        <div className="pr-footer-links">
          <Link to="/">Home</Link>
          <Link to="/apply-australia-pr">Apply Australia PR</Link>
          <Link to="/australia-pr-eligibility">Eligibility Check</Link>
          <Link to="/#book">Book Session</Link>
        </div>
        <p className="pr-footer-copy">© 2026 RouteUp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AustraliaPREligibility;
