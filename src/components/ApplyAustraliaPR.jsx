import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Plane, Upload } from 'lucide-react';
import SiteNavbar from './SiteNavbar';
import { API_URL } from '../config';
import {
  AU_STATES,
  PR_COUNTRIES,
  PR_OCCUPATIONS,
  UNIVERSAL_DOCS,
  findOccupation,
} from '../data/australiaPrData';

const ApplyAustraliaPR = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('offshore');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [occValue, setOccValue] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploaded, setUploaded] = useState({});
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const occupation = useMemo(() => findOccupation(occValue), [occValue]);

  const allDocs = useMemo(() => {
    if (!occupation) return [];
    return [...UNIVERSAL_DOCS, ...occupation.docs];
  }, [occupation]);

  const uploadedCount = allDocs.filter((doc) => uploaded[doc]?.file).length;
  const totalCount = allDocs.length;
  const progressPct = totalCount ? Math.round((uploadedCount / totalCount) * 100) : 0;

  const handleOccChange = (value) => {
    setOccValue(value);
    setUploaded({});
    setDocTitle('');
    setFileName('');
    setSelectedFile(null);
    if (value) {
      const occ = findOccupation(value);
      if (occ) setDocTitle(UNIVERSAL_DOCS[0] || '');
    }
  };

  const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB per file
  const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20MB total request

  const missingDocs = useMemo(
    () => allDocs.filter((doc) => !uploaded[doc]?.file),
    [allDocs, uploaded]
  );
  const allDocsUploaded = occupation && allDocs.length > 0 && missingDocs.length === 0;

  const handleAddDocument = () => {
    if (!occupation || !docTitle) return;
    if (!selectedFile) {
      toast.error('Please choose a file for this document — all documents are required.');
      return;
    }
    if (selectedFile.size > MAX_FILE_BYTES) {
      toast.error('Each file must be under 10MB. Please compress or use a smaller file.');
      return;
    }
    setUploaded((prev) => ({
      ...prev,
      [docTitle]: { fileName: selectedFile.name, file: selectedFile },
    }));
    setSelectedFile(null);
    setFileName('');
    toast.success(`${docTitle} added`);
  };

  const handleLeadSubmit = async () => {
    if (!leadName.trim() || !leadPhone.trim() || !leadEmail.trim()) {
      toast.error('Please fill in your name, phone, and email.');
      return;
    }
    if (!occupation) {
      toast.error('Please select your occupation first.');
      return;
    }
    if (!allDocsUploaded) {
      toast.error(
        `All documents are required for interview consideration. Missing: ${missingDocs.slice(0, 3).join(', ')}${missingDocs.length > 3 ? ` +${missingDocs.length - 3} more` : ''}`
      );
      return;
    }

    const files = Object.values(uploaded).map((info) => info.file).filter(Boolean);
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    if (totalSize > MAX_TOTAL_BYTES) {
      toast.error('Total upload size must be under 20MB. Please upload fewer or smaller files.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', leadName.trim());
      formData.append('phone', leadPhone.trim());
      formData.append('email', leadEmail.trim());
      formData.append('existingExperience', leadNotes.trim());
      formData.append('occupation', occupation.name);
      formData.append('anzsco', occupation.anzsco);
      formData.append('assessingBody', occupation.body);
      formData.append('source', 'document-upload');
      formData.append('origin', origin);
      formData.append('country', origin === 'offshore' ? country : '');
      formData.append('state', origin === 'onshore' ? state : '');

      const meta = Object.entries(uploaded).map(([title, info]) => ({
        title,
        fileName: info.fileName || '',
        attached: Boolean(info.file),
      }));
      formData.append('documentMeta', JSON.stringify(meta));

      Object.values(uploaded).forEach((info) => {
        if (info.file) formData.append('documents', info.file);
      });

      const res = await fetch(`${API_URL}/api/pr-leads`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error('Files are too large for the server. Please upload smaller files (under 10MB each).');
        }
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
        <div className="pr-hero-badge">Australia PR Migration Pathway</div>
        <h1>
          Your <span className="green">Australia PR</span> document checklist, built for your occupation.
        </h1>
        <p>
          Select your nominated occupation and we&apos;ll show the exact documents your assessing body
          requires — then you can upload them here for our team to review before your session.
        </p>

        <div className="pr-missing-banner">
          <span>Don&apos;t have your certification or assessment records yet?</span>
          <Link to="/australia-pr-eligibility" className="pr-missing-btn">
            Check what&apos;s missing instead →
          </Link>
        </div>
      </section>

      <section className="pr-section">
        <div className="pr-container">
          <div className="pr-page-title">
            <Plane size={22} />
            <span>Routeup PR application: document upload</span>
          </div>

          <div className="pr-card">
            <p className="pr-label">Applying from</p>
            <div className="pr-radio-row">
              <label className="pr-radio">
                <input
                  type="radio"
                  name="origin"
                  value="offshore"
                  checked={origin === 'offshore'}
                  onChange={() => setOrigin('offshore')}
                />
                Offshore (outside Australia)
              </label>
              <label className="pr-radio">
                <input
                  type="radio"
                  name="origin"
                  value="onshore"
                  checked={origin === 'onshore'}
                  onChange={() => setOrigin('onshore')}
                />
                Onshore (currently in Australia)
              </label>
            </div>

            {origin === 'offshore' ? (
              <select
                className="pr-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select country of current residence</option>
                {PR_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <select
                className="pr-select"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">Select Australian state or territory</option>
                {AU_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>

          <div className="pr-card">
            <p className="pr-label">Nominated occupation / trade</p>
            <select
              className="pr-select"
              value={occValue}
              onChange={(e) => handleOccChange(e.target.value)}
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
                <span className="pr-pill">{occupation.type}</span>
              </div>
            )}
          </div>

          {occupation && (
            <>
              <div className="pr-card">
                <p className="pr-label">
                  Upload a document <span className="req">*</span>
                </p>
                <p className="pr-upload-required-note">
                  Every document listed below is required. Incomplete uploads will not be considered for an interview.
                </p>
                <div className="pr-upload-row">
                  <select
                    className="pr-select"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                  >
                    <optgroup label="Standard documents (all required)">
                      {UNIVERSAL_DOCS.map((d) => (
                        <option key={d} value={d}>
                          {uploaded[d]?.file ? `✓ ${d}` : `${d} *`}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={`${occupation.body} checklist (all required)`}>
                      {occupation.docs.map((d) => (
                        <option key={d} value={d}>
                          {uploaded[d]?.file ? `✓ ${d}` : `${d} *`}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <label className="pr-file-btn">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        setFileName(file?.name || '');
                      }}
                    />
                    {fileName || 'Choose file *'}
                  </label>
                  <button type="button" className="pr-add-btn" onClick={handleAddDocument}>
                    <Upload size={16} />
                    Add document
                  </button>
                </div>
              </div>

              <div className="pr-progress-row">
                <div className="pr-progress-track">
                  <div className="pr-progress-bar" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="pr-progress-text">
                  {uploadedCount} of {totalCount} uploaded
                  {!allDocsUploaded && (
                    <span className="pr-progress-missing"> — {missingDocs.length} required remaining</span>
                  )}
                </span>
              </div>

              <div className="pr-card">
                <p className="pr-label">Standard documents (all applicants) — all required *</p>
                {UNIVERSAL_DOCS.map((doc) => (
                  <div className={`pr-check-row ${uploaded[doc]?.file ? '' : 'pr-check-required-missing'}`} key={doc}>
                    <span>{doc} <span className="req">*</span></span>
                    {uploaded[doc]?.file ? (
                      <span className="pr-check-ok">
                        <Check size={14} /> {uploaded[doc].fileName}
                      </span>
                    ) : (
                      <span className="pr-check-pending">Required — not uploaded</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pr-card">
                <p className="pr-label">
                  {occupation.body} checklist — {occupation.name} — all required *
                </p>
                {occupation.docs.map((doc) => (
                  <div className={`pr-check-row ${uploaded[doc]?.file ? '' : 'pr-check-required-missing'}`} key={doc}>
                    <span>{doc} <span className="req">*</span></span>
                    {uploaded[doc]?.file ? (
                      <span className="pr-check-ok">
                        <Check size={14} /> {uploaded[doc].fileName}
                      </span>
                    ) : (
                      <span className="pr-check-pending">Required — not uploaded</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pr-card">
                <h3 className="pr-card-title">Want to talk it through?</h3>
                <div className="pr-form-row">
                  <div className="pr-form-group">
                    <label>Full name <span className="req">*</span></label>
                    <input
                      type="text"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="pr-form-group">
                    <label>Phone / WhatsApp <span className="req">*</span></label>
                    <input
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div className="pr-form-group" style={{ marginBottom: 16 }}>
                  <label>Email address <span className="req">*</span></label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="pr-form-group" style={{ marginBottom: 16 }}>
                  <label>What experience or training do you already have?</label>
                  <textarea
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    placeholder="e.g. 5 years as an electrician, no formal trade certificate, trained on the job..."
                  />
                </div>
                <button
                  type="button"
                  className="pr-submit-btn"
                  onClick={handleLeadSubmit}
                  disabled={submitting || !allDocsUploaded}
                >
                  {submitting
                    ? 'Saving...'
                    : allDocsUploaded
                      ? 'Book a Visa & Migration session'
                      : `Upload all ${totalCount} documents to continue`}
                </button>
                {!allDocsUploaded && (
                  <p className="pr-secure-note" style={{ color: '#b45309' }}>
                    Missing documents mean your application will not be considered for an interview.
                  </p>
                )}
                <p className="pr-secure-note">
                  After you submit, our team will connect with you within 24 hours.
                </p>
              </div>
            </>
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

export default ApplyAustraliaPR;
