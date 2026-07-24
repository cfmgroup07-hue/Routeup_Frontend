import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import { API_URL } from '../config';
import { STUDY_ABROAD_COUNTRIES } from '../data/studyAbroadData';

const StudyAbroadDocuments = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [university, setUniversity] = useState('');
  const [country, setCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setCourse('');
    setUniversity('');
    setCountry('');
    setFormKey((key) => key + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('applyingCourse', course.trim());
      formData.append('targetUniversity', university.trim());
      formData.append('country', country);
      formData.append('totalRequired', '0');
      formData.append('documentMeta', JSON.stringify([]));

      const res = await fetch(`${API_URL}/api/study-abroad-leads`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit');
      }

      toast.success('Submitted');
      resetForm();
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
        <div className="pr-hero-badge">Study Abroad — Application</div>
        <h1>
          Your study abroad
          <br />
          <span className="green">application</span>, started right.
        </h1>
        <p>
          Tell us your course and destination country. Our team will review your profile and request
          any documents needed for your country by email.
        </p>
        <div className="pr-disclaimer">
          <strong>Note:</strong> Every university and country has its own final checklist, and
          requirements change often. Treat this as a strong starting point, not a substitute for your
          specific university&apos;s admissions portal or visa office instructions.
        </div>
        <div className="pr-missing-banner">
          <span>Want to understand what documents usually matter — and funds required by country?</span>
          <Link to="/study-abroad-why-documents" className="pr-missing-btn">
            Why these documents →
          </Link>
        </div>
      </section>

      <section className="pr-section">
        <div className="pr-container" key={formKey}>
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
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select destination country</option>
                {STUDY_ABROAD_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="pr-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || !country}
          >
            {submitting
              ? 'Saving...'
              : country
                ? 'Submit application'
                : 'Select a country to continue'}
          </button>
          <p className="pr-secure-note">
            After you submit, our team will connect with you and request any documents needed for
            your country by email. You&apos;ll still complete payment on the Book Session page.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default StudyAbroadDocuments;
