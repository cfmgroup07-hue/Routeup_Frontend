import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Upload } from 'lucide-react';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import { API_URL } from '../config';
import {
  STUDY_ABROAD_COUNTRIES,
  getAllStudyAbroadDocs,
  getStudyAbroadSections,
} from '../data/studyAbroadData';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 100 * 1024 * 1024;

const StudyAbroadDocuments = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [university, setUniversity] = useState('');
  const [country, setCountry] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploaded, setUploaded] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const sections = useMemo(() => getStudyAbroadSections(country), [country]);
  const allDocs = useMemo(() => getAllStudyAbroadDocs(country), [country]);
  const uploadedCount = allDocs.filter((doc) => uploaded[doc]?.file).length;
  const totalCount = allDocs.length;
  const progressPct = totalCount ? Math.round((uploadedCount / totalCount) * 100) : 0;
  const missingDocs = useMemo(
    () => allDocs.filter((doc) => !uploaded[doc]?.file),
    [allDocs, uploaded]
  );
  const allDocsUploaded = Boolean(country) && allDocs.length > 0 && missingDocs.length === 0;

  const handleCountryChange = (value) => {
    setCountry(value);
    setUploaded({});
    setSelectedFile(null);
    setFileName('');
    if (value) {
      const first = getAllStudyAbroadDocs(value)[0] || '';
      setDocTitle(first);
    } else {
      setDocTitle('');
    }
  };

  const handleAddDocument = () => {
    if (!country || !docTitle) return;
    if (!selectedFile) {
      toast.error('Please choose a file to add this document.');
      return;
    }
    if (selectedFile.size > MAX_FILE_BYTES) {
      toast.error('Each file must be under 10MB.');
      return;
    }
    setUploaded((prev) => ({
      ...prev,
      [docTitle]: { fileName: selectedFile.name, file: selectedFile },
    }));
    setSelectedFile(null);
    setFileName('');
    toast.success('Document added');
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error('Please fill in your name, phone, and email.');
      return;
    }
    if (!course.trim()) {
      toast.error('Please enter the course you are applying for.');
      return;
    }
    if (!country) {
      toast.error('Please select your destination country.');
      return;
    }

    const files = allDocs
      .filter((title) => uploaded[title]?.file)
      .map((title) => uploaded[title].file);
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    if (totalSize > MAX_TOTAL_BYTES) {
      toast.error('Total upload size must be under 100MB. Please compress larger files.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('applyingCourse', course.trim());
      formData.append('targetUniversity', university.trim());
      formData.append('country', country);
      formData.append('totalRequired', String(totalCount));

      // Include full checklist so admin can see uploaded + missing titles
      const meta = allDocs.map((title) => {
        const info = uploaded[title];
        return {
          title,
          fileName: info?.fileName || '',
          attached: Boolean(info?.file),
        };
      });
      formData.append('documentMeta', JSON.stringify(meta));
      files.forEach((file) => formData.append('documents', file));

      const res = await fetch(`${API_URL}/api/study-abroad-leads`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error('Files are too large for the server. Please upload smaller files.');
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit');
      }

      toast.success('Documents saved! Continue to book your session.');
      navigate({ pathname: '/', hash: 'book' });
    } catch (error) {
      toast.error(error.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pr-page">
      <SiteNavbar active="study-abroad" />

      <section className="pr-hero">
        <div className="pr-hero-badge">Study Abroad — Document Upload</div>
        <h1>
          Your study abroad
          <br />
          <span className="green">document checklist</span>, sorted.
        </h1>
        <p>
          Tell us your course and destination country and we&apos;ll show the exact documents your
          university and visa application need — then upload them here for our team to review.
        </p>
        <div className="pr-disclaimer">
          <strong>Note:</strong> Every university and country has its own final checklist, and
          requirements change often. Treat this as a strong starting point, not a substitute for your
          specific university&apos;s admissions portal or visa office instructions.
        </div>
        <div className="pr-missing-banner">
          <span>Missing a document? See why each one matters — and funds required by country.</span>
          <Link to="/study-abroad-why-documents" className="pr-missing-btn">
            Why these documents →
          </Link>
        </div>
      </section>

      <section className="pr-section">
        <div className="pr-container">
          <div className="pr-card">
            <h3 className="pr-card-title">Student details</h3>
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
                <label>Contact number / WhatsApp <span className="req">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="pr-form-group">
              <label>Email address <span className="req">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="pr-card">
            <h3 className="pr-card-title">Course &amp; destination</h3>
            <div className="pr-form-row">
              <div className="pr-form-group">
                <label>Applying course <span className="req">*</span></label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. MSc Information Systems"
                />
              </div>
              <div className="pr-form-group">
                <label>Target university (optional)</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Monash University Malaysia"
                />
              </div>
            </div>
            <div className="pr-form-group">
              <label>Destination country <span className="req">*</span></label>
              <select
                className="pr-select"
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                <option value="">Select destination country</option>
                {STUDY_ABROAD_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {country && (
              <div className="pr-occ-info">
                <span className="pr-pill primary">
                  {totalCount} documents typically required for {country}
                </span>
              </div>
            )}
          </div>

          {country && (
            <>
              <div className="pr-card">
                <h3 className="pr-card-title">Upload a document</h3>
                <p className="pr-upload-required-note">
                  Documents are optional — upload what you have now. Yellow = not uploaded yet, green = uploaded.
                  You can submit and book a session even if some files are still missing.
                </p>
                <div className="pr-upload-row">
                  <select
                    className="pr-select"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                  >
                    {sections.map((section) => (
                      <optgroup key={section.title} label={section.title}>
                        {section.docs.map((d) => (
                          <option key={d} value={d}>
                            {uploaded[d]?.file ? `✓ ${d}` : d}
                          </option>
                        ))}
                      </optgroup>
                    ))}
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
                    {fileName || 'Choose file'}
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
                    <span className="pr-progress-missing"> — {missingDocs.length} still missing</span>
                  )}
                </span>
              </div>

              {sections.map((section) => (
                <div className="pr-card" key={section.title}>
                  <p className="pr-label" style={{ color: '#0d7c3d', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: 13 }}>
                    {section.title} — optional
                  </p>
                  {section.docs.map((doc) => (
                    <div className="pr-check-row" key={doc}>
                      <span className="pr-check-doc-label">
                        <span className={`pr-check-dot ${uploaded[doc]?.file ? 'done' : 'pending'}`} />
                        <span>{doc}</span>
                      </span>
                      {uploaded[doc]?.file ? (
                        <span className="pr-check-ok">
                          <Check size={14} /> {uploaded[doc].fileName}
                        </span>
                      ) : (
                        <span className="pr-check-pending">Optional — not uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          <button
            type="button"
            className="pr-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || !country}
          >
            {submitting
              ? 'Saving...'
              : country
                ? 'Submit & continue'
                : 'Select a country to continue'}
          </button>
          <p className="pr-secure-note">
            Your documents are reviewed by our team before your paid advisory session. You&apos;ll still
            complete payment on the Book Session page.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default StudyAbroadDocuments;
