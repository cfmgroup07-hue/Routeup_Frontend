import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';
import SiteNavbar from './SiteNavbar';
import { API_URL } from '../config';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const AustraliaPRReupload = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null);
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const loadReuploadInfo = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/pr-leads/reupload/${token}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Invalid re-upload link');
      }
      setInfo(data);
    } catch (err) {
      setError(err.message || 'Could not load re-upload page');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadReuploadInfo();
  }, [token]);

  const handleSubmit = async () => {
    if (!info?.documents?.length) return;

    const missing = info.documents.filter((d) => !files[d.title]);
    if (missing.length) {
      toast.error(`Please choose a file for: ${missing[0].title}`);
      return;
    }

    for (const doc of info.documents) {
      if (files[doc.title]?.size > MAX_FILE_BYTES) {
        toast.error(`${doc.title} must be under 10MB`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      const meta = info.documents.map((d) => ({
        title: d.title,
        fileName: files[d.title]?.name || '',
        attached: true,
      }));
      formData.append('documentMeta', JSON.stringify(meta));
      info.documents.forEach((d) => {
        formData.append('documents', files[d.title]);
      });

      const res = await fetch(`${API_URL}/api/pr-leads/reupload/${token}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setFiles({});
      setInputKey((key) => key + 1);
      setError('');

      if (data.completed) {
        setInfo({
          name: data.name || info.name,
          occupation: data.occupation || info.occupation,
          completed: true,
          documents: [],
          message:
            data.message ||
            'Thank you! Your documents have been submitted successfully. Our team will review them shortly.',
        });
      } else {
        toast.success(data.message || 'Documents updated');
        await loadReuploadInfo({ silent: true });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.message || 'Could not update documents');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pr-page">
      <SiteNavbar active="australia-pr" />

      <section className="pr-hero">
        <div className="pr-hero-badge">Australia PR — Re-upload</div>
        <h1>
          Re-upload your <span className="green">documents</span>
        </h1>
        <p>
          Our team asked you to upload specific files. Upload them below — your application
          will update automatically.
        </p>
      </section>

      <section className="pr-section">
        <div className="pr-container">
          {loading && <div className="pr-card">Loading re-upload details...</div>}

          {!loading && error && (
            <div className="pr-card">
              <h3 className="pr-card-title">Link unavailable</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6 }}>{error}</p>
              <Link to="/" className="pr-submit-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: 16, maxWidth: 240 }}>
                Back to Home
              </Link>
            </div>
          )}

          {!loading && !error && info && (
            <>
              {info.completed ? (
                <div className="pr-card" style={{ textAlign: 'center', padding: '36px 28px' }}>
                  <h3 className="pr-card-title" style={{ marginBottom: 12 }}>Thank you!</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
                    {info.message ||
                      'Your documents have been submitted successfully. Our team will review them shortly.'}
                  </p>
                  <Link
                    to="/"
                    className="pr-submit-btn"
                    style={{ display: 'inline-block', textDecoration: 'none', maxWidth: 240 }}
                  >
                    Back to Home
                  </Link>
                </div>
              ) : (
              <>
              <div className="pr-card">
                <h3 className="pr-card-title">Application</h3>
                <div className="pr-occ-info">
                  <span className="pr-pill primary">{info.name}</span>
                  <span className="pr-pill">{info.occupation}</span>
                </div>
              </div>

              <div className="pr-card">
                <h3 className="pr-card-title">Documents requested *</h3>
                {info.documents.map((doc) => {
                  const chosen = files[doc.title];
                  return (
                    <div className="pr-check-row" key={doc.title} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                      <div className="pr-check-doc-label">
                        <span className={`pr-check-dot ${chosen ? 'done' : 'pending'}`} />
                        <span>
                          <strong>{doc.title}</strong>
                          {doc.reuploadNote && (
                            <div style={{ fontSize: 12, color: '#a16207', marginTop: 4 }}>{doc.reuploadNote}</div>
                          )}
                          {doc.currentFileName ? (
                            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                              Previous: {doc.currentFileName}
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: '#a16207', marginTop: 2 }}>
                              Not uploaded yet — please upload now
                            </div>
                          )}
                        </span>
                      </div>
                      <label className={`pr-file-btn pr-file-btn--block${chosen ? ' has-file' : ''}`}>
                        <input
                          key={`${inputKey}-${doc.title}`}
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setFiles((prev) => ({ ...prev, [doc.title]: file }));
                          }}
                        />
                        <Upload size={18} />
                        <span>{chosen?.name || (doc.currentFileName ? 'Choose new file *' : 'Choose file *')}</span>
                      </label>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="pr-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  'Uploading...'
                ) : (
                  <>
                    <Upload size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Submit corrected documents
                  </>
                )}
              </button>
              <p className="pr-secure-note">Each file max 10MB. Accepted: PDF, DOC, DOCX, JPG, PNG, WEBP.</p>
              </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default AustraliaPRReupload;
