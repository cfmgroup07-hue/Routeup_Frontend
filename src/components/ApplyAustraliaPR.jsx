import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Plane, Upload } from 'lucide-react';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import { API_URL } from '../config';
import {
  AU_STATES,
  PR_COUNTRIES,
  PR_OCCUPATIONS,
  UNIVERSAL_DOCS,
  findOccupation,
} from '../data/australiaPrData';

const MARITAL_OPTIONS = ['Single', 'Married', 'De facto', 'Divorced', 'Widowed'];
const PATHWAY_OPTIONS = [
  { value: '189', label: 'Skilled Independent Visa (Subclass 189)' },
  { value: '190', label: 'Skilled Nominated Visa (Subclass 190)' },
  { value: 'unsure', label: "I'm not sure (Please assess my eligibility)" },
];
const QUALIFICATION_OPTIONS = ["Diploma", "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'];
const ENGLISH_TEST_TYPES = ['IELTS', 'PTE Academic', 'TOEFL', 'OET'];

const emptyForm = () => ({
  fullName: '',
  email: '',
  mobile: '',
  dateOfBirth: '',
  passportNumber: '',
  countryOfCitizenship: '',
  currentCountryOfResidence: '',
  maritalStatus: '',
  migrationPathway: '',
  highestQualification: '',
  fieldOfStudy: '',
  university: '',
  countryOfStudy: '',
  graduationYear: '',
  englishTestCompleted: '',
  englishTestType: '',
  englishOverall: '',
  englishListening: '',
  englishReading: '',
  englishWriting: '',
  englishSpeaking: '',
  englishTestDate: '',
  partnerMigrating: '',
  partnerOccupation: '',
  partnerEnglishTest: '',
  partnerQualification: '',
  skillsAssessmentCompleted: '',
  assessingAuthority: '',
  skillsAssessmentOutcome: '',
  studiedInAustralia: '',
  professionalYearCompleted: '',
  naatiAccreditation: '',
});

const ApplyAustraliaPR = () => {
  const [origin, setOrigin] = useState('offshore');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [occValue, setOccValue] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [docTitle, setDocTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploaded, setUploaded] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const resetForm = () => {
    setOrigin('offshore');
    setCountry('');
    setState('');
    setOccValue('');
    setForm(emptyForm());
    setDocTitle('');
    setFileName('');
    setSelectedFile(null);
    setUploaded({});
    setFormKey((key) => key + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const occupation = useMemo(() => findOccupation(occValue), [occValue]);

  const allDocs = useMemo(() => {
    if (!occupation) return [];
    return [...UNIVERSAL_DOCS, ...occupation.docs];
  }, [occupation]);

  const uploadedCount = allDocs.filter((doc) => uploaded[doc]?.file).length;
  const totalCount = allDocs.length;
  const progressPct = totalCount ? Math.round((uploadedCount / totalCount) * 100) : 0;

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOccChange = (value) => {
    setOccValue(value);
    setUploaded({});
    setDocTitle('');
    setFileName('');
    setSelectedFile(null);

    const occ = findOccupation(value);
    if (occ) {
      setDocTitle(UNIVERSAL_DOCS[0] || '');
      setForm((prev) => ({
        ...prev,
        assessingAuthority: prev.assessingAuthority || occ.body,
      }));
    } else {
      setForm(emptyForm());
    }
  };

  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 100 * 1024 * 1024;

  const missingDocs = useMemo(
    () => allDocs.filter((doc) => !uploaded[doc]?.file),
    [allDocs, uploaded]
  );
  const allDocsUploaded = occupation && allDocs.length > 0 && missingDocs.length === 0;

  const handleAddDocument = () => {
    if (!occupation || !docTitle) return;
    if (!selectedFile) {
      toast.error('Please choose a file to add this document.');
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

  const validateForm = () => {
    const required = [
      ['fullName', 'Full Name'],
      ['email', 'Email Address'],
      ['mobile', 'Mobile Number'],
      ['dateOfBirth', 'Date of Birth'],
      ['countryOfCitizenship', 'Country of Citizenship'],
      ['currentCountryOfResidence', 'Current Country of Residence'],
      ['maritalStatus', 'Marital Status'],
      ['migrationPathway', 'Migration Pathway'],
      ['highestQualification', 'Highest Qualification'],
      ['fieldOfStudy', 'Field of Study'],
      ['university', 'University / Institution'],
      ['countryOfStudy', 'Country of Study'],
      ['graduationYear', 'Graduation Year'],
      ['englishTestCompleted', 'English test completion status'],
      ['partnerMigrating', 'Partner migration intent'],
      ['skillsAssessmentCompleted', 'Skills Assessment status'],
    ];

    for (const [key, label] of required) {
      if (!String(form[key] || '').trim()) {
        toast.error(`Please fill in: ${label}`);
        return false;
      }
    }

    if (form.englishTestCompleted === 'yes') {
      if (!form.englishTestType) {
        toast.error('Please select your English test type.');
        return false;
      }
    }

    return true;
  };

  const handleLeadSubmit = async () => {
    if (!occupation) {
      toast.error('Please select your occupation first.');
      return;
    }
    if (!validateForm()) return;

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
      formData.append('name', form.fullName.trim());
      formData.append('phone', form.mobile.trim());
      formData.append('email', form.email.trim());
      formData.append('existingExperience', '');
      formData.append('occupation', occupation.name);
      formData.append('anzsco', occupation.anzsco);
      formData.append('assessingBody', occupation.body);
      formData.append('source', 'document-upload');
      formData.append('origin', origin);
      formData.append('country', origin === 'offshore' ? country : '');
      formData.append('state', origin === 'onshore' ? state : '');

      const { fullName, email, mobile, ...applicationDetails } = form;
      formData.append('applicationDetails', JSON.stringify({
        ...applicationDetails,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
      }));

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

      toast.success('Submitted');
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const RadioGroup = ({ name, options, value, onChange }) => (
    <div className="pr-radio-row">
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        return (
          <label className="pr-radio" key={optValue}>
            <input
              type="radio"
              name={name}
              value={optValue}
              checked={value === optValue}
              onChange={() => onChange(optValue)}
            />
            {optLabel}
          </label>
        );
      })}
    </div>
  );

  return (
    <div className="pr-page">
      <SiteNavbar active="australia-pr" />

      <section className="pr-hero">
        <div className="pr-hero-badge">Australia PR Migration Pathway</div>
        <h1>
          Your <span className="green">Australia PR</span> application — tell us about yourself first.
        </h1>
        <p>
          Select your nominated occupation, complete your profile, then upload any documents you already have.
          Our team will review everything before your session.
        </p>

        <div className="pr-missing-banner">
          <span>Don&apos;t have your certification or assessment records yet?</span>
          <Link to="/australia-pr-eligibility" className="pr-missing-btn">
            Check what&apos;s missing instead →
          </Link>
        </div>
      </section>

      <section className="pr-section">
        <div className="pr-container" key={formKey}>
          <div className="pr-page-title">
            <Plane size={22} />
            <span>Routeup PR application</span>
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
              {/* ── Application Form (shown first) ── */}
              <div className="pr-card pr-application-form">
                <h3 className="pr-card-title">Your application details</h3>
                <p className="pr-form-intro">
                  Complete the sections below so we can assess your eligibility and prepare for your session.
                </p>

                {/* Personal Information */}
                <div className="pr-form-section">
                  <h4 className="pr-form-section-title">Personal Information</h4>
                  <div className="pr-form-row">
                    <div className="pr-form-group">
                      <label>Full Name <span className="req">*</span></label>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => updateForm('fullName', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="pr-form-group">
                      <label>Email Address <span className="req">*</span></label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="pr-form-row">
                    <div className="pr-form-group">
                      <label>Mobile Number (WhatsApp) <span className="req">*</span></label>
                      <input
                        type="tel"
                        value={form.mobile}
                        onChange={(e) => updateForm('mobile', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="pr-form-group">
                      <label>Date of Birth <span className="req">*</span></label>
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="pr-form-row">
                    <div className="pr-form-group">
                      <label>Passport Number</label>
                      <input
                        type="text"
                        value={form.passportNumber}
                        onChange={(e) => updateForm('passportNumber', e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="pr-form-group">
                      <label>Country of Citizenship <span className="req">*</span></label>
                      <select
                        className="pr-select"
                        value={form.countryOfCitizenship}
                        onChange={(e) => updateForm('countryOfCitizenship', e.target.value)}
                      >
                        <option value="">Select country</option>
                        {PR_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="pr-form-row">
                    <div className="pr-form-group">
                      <label>Current Country of Residence <span className="req">*</span></label>
                      <select
                        className="pr-select"
                        value={form.currentCountryOfResidence}
                        onChange={(e) => updateForm('currentCountryOfResidence', e.target.value)}
                      >
                        <option value="">Select country</option>
                        {PR_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="pr-form-group">
                      <label>Marital Status <span className="req">*</span></label>
                      <select
                        className="pr-select"
                        value={form.maritalStatus}
                        onChange={(e) => updateForm('maritalStatus', e.target.value)}
                      >
                        <option value="">Select status</option>
                        {MARITAL_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Migration Pathway */}
                <div className="pr-form-section">
                  <h4 className="pr-form-section-title">Migration Pathway</h4>
                  <p className="pr-form-hint">Which pathway are you interested in?</p>
                  <RadioGroup
                    name="migrationPathway"
                    options={PATHWAY_OPTIONS}
                    value={form.migrationPathway}
                    onChange={(v) => updateForm('migrationPathway', v)}
                  />
                </div>

                {/* Education */}
                <div className="pr-form-section">
                  <h4 className="pr-form-section-title">Education</h4>
                  <div className="pr-form-row">
                    <div className="pr-form-group">
                      <label>Highest Qualification <span className="req">*</span></label>
                      <select
                        className="pr-select"
                        value={form.highestQualification}
                        onChange={(e) => updateForm('highestQualification', e.target.value)}
                      >
                        <option value="">Select qualification</option>
                        {QUALIFICATION_OPTIONS.map((q) => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                    <div className="pr-form-group">
                      <label>Field of Study <span className="req">*</span></label>
                      <input
                        type="text"
                        value={form.fieldOfStudy}
                        onChange={(e) => updateForm('fieldOfStudy', e.target.value)}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                  </div>
                  <div className="pr-form-row">
                    <div className="pr-form-group">
                      <label>University / Institution <span className="req">*</span></label>
                      <input
                        type="text"
                        value={form.university}
                        onChange={(e) => updateForm('university', e.target.value)}
                        placeholder="Name of institution"
                      />
                    </div>
                    <div className="pr-form-group">
                      <label>Country of Study <span className="req">*</span></label>
                      <select
                        className="pr-select"
                        value={form.countryOfStudy}
                        onChange={(e) => updateForm('countryOfStudy', e.target.value)}
                      >
                        <option value="">Select country</option>
                        {PR_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="pr-form-row">
                    <div className="pr-form-group">
                      <label>Graduation Year <span className="req">*</span></label>
                      <input
                        type="number"
                        min="1970"
                        max="2030"
                        value={form.graduationYear}
                        onChange={(e) => updateForm('graduationYear', e.target.value)}
                        placeholder="e.g. 2018"
                      />
                    </div>
                    <div className="pr-form-group" />
                  </div>
                </div>

                {/* English Language */}
                <div className="pr-form-section">
                  <h4 className="pr-form-section-title">English Language</h4>
                  <p className="pr-form-hint">Have you completed an English test?</p>
                  <RadioGroup
                    name="englishTestCompleted"
                    options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                    value={form.englishTestCompleted}
                    onChange={(v) => updateForm('englishTestCompleted', v)}
                  />

                  {form.englishTestCompleted === 'yes' && (
                    <div className="pr-conditional-block">
                      <div className="pr-form-group" style={{ marginBottom: 12 }}>
                        <label>Test Type <span className="req">*</span></label>
                        <select
                          className="pr-select"
                          value={form.englishTestType}
                          onChange={(e) => updateForm('englishTestType', e.target.value)}
                        >
                          <option value="">Select test type</option>
                          {ENGLISH_TEST_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="pr-form-row">
                        <div className="pr-form-group">
                          <label>Overall Score</label>
                          <input
                            type="text"
                            value={form.englishOverall}
                            onChange={(e) => updateForm('englishOverall', e.target.value)}
                            placeholder="e.g. 7.5"
                          />
                        </div>
                        <div className="pr-form-group">
                          <label>Test Date</label>
                          <input
                            type="date"
                            value={form.englishTestDate}
                            onChange={(e) => updateForm('englishTestDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="pr-form-row">
                        <div className="pr-form-group">
                          <label>Listening</label>
                          <input
                            type="text"
                            value={form.englishListening}
                            onChange={(e) => updateForm('englishListening', e.target.value)}
                          />
                        </div>
                        <div className="pr-form-group">
                          <label>Reading</label>
                          <input
                            type="text"
                            value={form.englishReading}
                            onChange={(e) => updateForm('englishReading', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="pr-form-row">
                        <div className="pr-form-group">
                          <label>Writing</label>
                          <input
                            type="text"
                            value={form.englishWriting}
                            onChange={(e) => updateForm('englishWriting', e.target.value)}
                          />
                        </div>
                        <div className="pr-form-group">
                          <label>Speaking</label>
                          <input
                            type="text"
                            value={form.englishSpeaking}
                            onChange={(e) => updateForm('englishSpeaking', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Partner Details */}
                <div className="pr-form-section">
                  <h4 className="pr-form-section-title">Partner Details (if applicable)</h4>
                  <p className="pr-form-hint">Does your partner intend to migrate with you?</p>
                  <RadioGroup
                    name="partnerMigrating"
                    options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                    value={form.partnerMigrating}
                    onChange={(v) => updateForm('partnerMigrating', v)}
                  />

                  {form.partnerMigrating === 'yes' && (
                    <div className="pr-conditional-block">
                      <div className="pr-form-row">
                        <div className="pr-form-group">
                          <label>Partner&apos;s Occupation</label>
                          <input
                            type="text"
                            value={form.partnerOccupation}
                            onChange={(e) => updateForm('partnerOccupation', e.target.value)}
                          />
                        </div>
                        <div className="pr-form-group">
                          <label>Partner&apos;s English Test</label>
                          <input
                            type="text"
                            value={form.partnerEnglishTest}
                            onChange={(e) => updateForm('partnerEnglishTest', e.target.value)}
                            placeholder="e.g. IELTS 7.0"
                          />
                        </div>
                      </div>
                      <div className="pr-form-group">
                        <label>Partner&apos;s Qualification</label>
                        <input
                          type="text"
                          value={form.partnerQualification}
                          onChange={(e) => updateForm('partnerQualification', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills Assessment */}
                <div className="pr-form-section">
                  <h4 className="pr-form-section-title">Skills Assessment</h4>
                  <p className="pr-form-hint">Have you completed a Skills Assessment? <span className="req">*</span></p>
                  <RadioGroup
                    name="skillsAssessmentCompleted"
                    options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                    value={form.skillsAssessmentCompleted}
                    onChange={(v) => updateForm('skillsAssessmentCompleted', v)}
                  />

                  {form.skillsAssessmentCompleted === 'yes' && (
                    <div className="pr-conditional-block">
                      <div className="pr-form-row">
                        <div className="pr-form-group">
                          <label>Assessing Authority</label>
                          <input
                            type="text"
                            value={form.assessingAuthority}
                            onChange={(e) => updateForm('assessingAuthority', e.target.value)}
                            placeholder="Optional"
                          />
                        </div>
                        <div className="pr-form-group">
                          <label>Outcome</label>
                          <input
                            type="text"
                            value={form.skillsAssessmentOutcome}
                            onChange={(e) => updateForm('skillsAssessmentOutcome', e.target.value)}
                            placeholder="Optional — e.g. Suitable"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Australian Study */}
                <div className="pr-form-section">
                  <h4 className="pr-form-section-title">Australian Study (Optional)</h4>
                  <div className="pr-form-row">
                    <div className="pr-form-group">
                      <label>Have you studied in Australia?</label>
                      <select
                        className="pr-select"
                        value={form.studiedInAustralia}
                        onChange={(e) => updateForm('studiedInAustralia', e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="pr-form-group">
                      <label>Have you completed a Professional Year?</label>
                      <select
                        className="pr-select"
                        value={form.professionalYearCompleted}
                        onChange={(e) => updateForm('professionalYearCompleted', e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>
                  <div className="pr-form-group">
                    <label>Do you have NAATI accreditation?</label>
                    <select
                      className="pr-select"
                      value={form.naatiAccreditation}
                      onChange={(e) => updateForm('naatiAccreditation', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Document Upload (below form) ── */}
              <div className="pr-card">
                <h3 className="pr-card-title">Document upload</h3>
                <p className="pr-upload-required-note">
                  Documents are optional — upload what you have now. Yellow = not uploaded yet, green = uploaded.
                  You can submit even if some files are still missing.
                </p>
                <div className="pr-upload-row">
                  <select
                    className="pr-select"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                  >
                    <optgroup label="Standard documents (optional)">
                      {UNIVERSAL_DOCS.map((d) => (
                        <option key={d} value={d}>
                          {uploaded[d]?.file ? `✓ ${d}` : d}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={`${occupation.body} checklist (optional)`}>
                      {occupation.docs.map((d) => (
                        <option key={d} value={d}>
                          {uploaded[d]?.file ? `✓ ${d}` : d}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <label className="pr-file-btn">
                    <input
                      type="file"
                      accept=".pdf"
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

              <div className="pr-card">
                <p className="pr-label">Standard documents (all applicants) — optional</p>
                {UNIVERSAL_DOCS.map((doc) => (
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

              <div className="pr-card">
                <p className="pr-label">
                  {occupation.body} checklist — {occupation.name} — optional
                </p>
                {occupation.docs.map((doc) => (
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

              <div className="pr-card">
                <button
                  type="button"
                  className="pr-submit-btn"
                  onClick={handleLeadSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit application'}
                </button>
                <p className="pr-secure-note">
                  After you submit, our team will connect with you within 24 hours.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default ApplyAustraliaPR;
