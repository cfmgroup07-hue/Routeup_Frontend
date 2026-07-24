import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import CustomSelect from './CustomSelect';
import { API_URL } from '../config';
import {
  UNIVERSITIES,
  SCHOLARSHIPS,
  UNI_COUNTRIES,
  SCH_COUNTRIES,
} from '../data/universitiesScholarships';
import './UniversitiesScholarships.css';

const PAGE_SIZE = 15;
const SCHOLARSHIP_SESSION_PRICE = 12000;

const toOptions = (list) => list.map((item) => ({ value: item, label: item }));

const EDUCATION_OPTIONS = toOptions([
  'Below 10th',
  '10th Pass',
  '12th Pass',
  'ITI / Diploma',
  'Graduate (BA/BSc/BCom)',
  'Engineering Degree',
  'Post Graduate',
  'Other',
]);

const STATUS_OPTIONS = toOptions([
  'Student',
  'Unemployed - Looking for work',
  'Working - Want to switch',
  'Working - Want overseas job',
  'Freelancer / Self-employed',
  'Other',
]);

const BUDGET_OPTIONS = toOptions([
  'Under ₹20 lakh',
  '₹20–40 lakh',
  '₹40–60 lakh',
  '₹60 lakh+',
  'Not sure yet',
]);

const TIMELINE_OPTIONS = toOptions([
  '2026 intake',
  '2027 intake',
  'Within 6 months',
  'Within 1 year',
  'Just exploring',
]);

const GUIDE_CARDS = [
  {
    title: 'What is a scholarship?',
    body: (
      <p>
        Money given to help pay for your studies that you do <strong>not</strong> pay back — unlike
        a loan. It can come from a government, a university, or a private organisation.
      </p>
    ),
  },
  {
    title: "Types you'll see",
    body: (
      <ul>
        <li>Full — covers tuition + living costs (often flights, insurance too)</li>
        <li>Partial — pays part of tuition (e.g. 25%, 50%)</li>
        <li>Merit-based — for strong grades, talent, achievements</li>
        <li>Need-based — for students who need financial help</li>
        <li>Country/development awards — for specific countries (Australia Awards, DAAD, Manaaki)</li>
      </ul>
    ),
  },
  {
    title: 'Why apply early — this is the big one',
    body: (
      <p>
        Big scholarship deadlines are often 6–12 months before your course starts, sometimes before
        or alongside your university application. Chevening (UK) closes early October; DAAD,
        Manaaki, MIS, and NAWA all close months ahead. If you wait until you&apos;re admitted,
        you&apos;ve usually already missed the funding.
      </p>
    ),
  },
  {
    title: "What you'll usually need",
    body: (
      <ul>
        <li>Valid passport</li>
        <li>Academic transcripts &amp; certificates</li>
        <li>English test — IELTS / TOEFL / PTE (book early)</li>
        <li>CV / resume</li>
        <li>Statement of Purpose or Motivation Letter</li>
        <li>1–2 reference letters, sometimes a university offer letter</li>
      </ul>
    ),
  },
  {
    title: 'Simple 6-step plan',
    body: (
      <p>
        1. Pick target countries and universities. 2. Check eligibility + deadline early for each
        scholarship. 3. Take your English test months ahead. 4. Write specific, non-generic essays.
        5. Submit before the deadline, never on the last day. 6. Track every application and its
        result.
      </p>
    ),
  },
  {
    title: 'Common mistakes & pro tip',
    body: (
      <p>
        Applying late, weak copy-paste essays, missing documents, ignoring smaller university
        scholarships, and applying to only one scholarship are the most common ways students lose
        out. Pro tip: you can often combine a university scholarship with a government one — always
        check if awards can be &quot;stacked.&quot;
      </p>
    ),
  },
];

const emptyForm = () => ({
  name: '',
  phone: '',
  email: '',
  age: '',
  address: '',
  education: '',
  currentStatus: '',
  skills: '',
  preferredCountries: '',
  budget: '',
  timeline: '',
  notes: '',
});

const FilterPills = ({ countries, active, onSelect }) => (
  <div className="usd-filter-pills">
    {countries.map((country) => (
      <button
        key={country}
        type="button"
        className={`usd-filter-pill${active === country ? ' active' : ''}`}
        onClick={() => onSelect(country)}
      >
        {country}
      </button>
    ))}
  </div>
);

const UniversitiesScholarships = () => {
  const [schCountry, setSchCountry] = useState('All');
  const [schQuery, setSchQuery] = useState('');
  const [schPage, setSchPage] = useState(1);
  const [uniCountry, setUniCountry] = useState('All');
  const [uniQuery, setUniQuery] = useState('');
  const [uniPage, setUniPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Universities & Scholarships Directory 2026–27 | RouteUp';
    return () => {
      document.title = 'RouteUp';
    };
  }, []);

  useEffect(() => {
    setSchPage(1);
  }, [schCountry, schQuery]);

  useEffect(() => {
    setUniPage(1);
  }, [uniCountry, uniQuery]);

  const filteredSchs = useMemo(() => {
    const q = schQuery.trim().toLowerCase();
    return SCHOLARSHIPS.filter(
      (s) =>
        (schCountry === 'All' || s.country === schCountry) &&
        (!q || s.name.toLowerCase().includes(q))
    );
  }, [schCountry, schQuery]);

  const filteredUnis = useMemo(() => {
    const q = uniQuery.trim().toLowerCase();
    return UNIVERSITIES.filter(
      (u) =>
        (uniCountry === 'All' || u.country === uniCountry) &&
        (!q || u.name.toLowerCase().includes(q) || u.location.toLowerCase().includes(q))
    );
  }, [uniCountry, uniQuery]);

  const schTotalPages = Math.max(1, Math.ceil(filteredSchs.length / PAGE_SIZE));
  const safeSchPage = Math.min(schPage, schTotalPages);
  const pagedSchs = useMemo(() => {
    const start = (safeSchPage - 1) * PAGE_SIZE;
    return filteredSchs.slice(start, start + PAGE_SIZE);
  }, [filteredSchs, safeSchPage]);

  const schRangeStart = filteredSchs.length === 0 ? 0 : (safeSchPage - 1) * PAGE_SIZE + 1;
  const schRangeEnd = Math.min(safeSchPage * PAGE_SIZE, filteredSchs.length);

  const uniTotalPages = Math.max(1, Math.ceil(filteredUnis.length / PAGE_SIZE));
  const safeUniPage = Math.min(uniPage, uniTotalPages);
  const pagedUnis = useMemo(() => {
    const start = (safeUniPage - 1) * PAGE_SIZE;
    return filteredUnis.slice(start, start + PAGE_SIZE);
  }, [filteredUnis, safeUniPage]);

  const uniRangeStart = filteredUnis.length === 0 ? 0 : (safeUniPage - 1) * PAGE_SIZE + 1;
  const uniRangeEnd = Math.min(safeUniPage * PAGE_SIZE, filteredUnis.length);

  const goToSchPage = (page) => {
    setSchPage(Math.min(Math.max(1, page), schTotalPages));
    document.getElementById('scholarships-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goToUniPage = (page) => {
    setUniPage(Math.min(Math.max(1, page), uniTotalPages));
    document.getElementById('universities-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const buildPayload = (razorpayResponse) => {
    const countries = form.preferredCountries
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    return {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      age: form.age.trim(),
      address: form.address.trim(),
      education: form.education,
      currentStatus: form.currentStatus,
      skills: form.skills.trim(),
      preferredCountries: countries,
      budget: form.budget,
      timeline: form.timeline,
      notes: form.notes.trim(),
      amount: SCHOLARSHIP_SESSION_PRICE,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
    };
  };

  const saveLeadAfterPayment = async (razorpayResponse) => {
    const res = await fetch(`${API_URL}/api/university-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(razorpayResponse)),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Payment verified but failed to save enquiry');
    }
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error('Please fill in your name, phone, and email.');
      return;
    }
    if (!form.age.trim() || !form.address.trim()) {
      toast.error('Please fill in your age and address.');
      return;
    }
    if (!form.education || !form.currentStatus) {
      toast.error('Please select your education and current status.');
      return;
    }
    if (!form.preferredCountries.trim()) {
      toast.error('Please enter at least one preferred country.');
      return;
    }
    if (!form.budget || !form.timeline) {
      toast.error('Please select your budget and timeline.');
      return;
    }

    setSubmitting(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection.');
      }

      const orderResponse = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: SCHOLARSHIP_SESSION_PRICE }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to initialize payment gateway.');
      }

      const orderData = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RouteUp',
        description: 'Universities & Scholarships Session',
        image: '/Routeup Logo.png',
        order_id: orderData.id,
        handler: async (response) => {
          try {
            setSubmitting(true);
            await saveLeadAfterPayment(response);
            toast.success('Payment successful! Our team will contact you soon.');
            setForm(emptyForm());
            setFormKey((k) => k + 1);
            document.getElementById('book-session-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch (error) {
            toast.error(error.message || 'Could not finalize booking.');
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: form.name.trim(),
          email: form.email.trim(),
          contact: form.phone.trim(),
        },
        theme: {
          color: '#0d7c3d',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(response?.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Could not start payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="usd-page">
      <SiteNavbar active="universities-scholarships" />

      <section className="usd-hero">
        <div className="usd-hero-badge">Study Abroad — 2026–27 Directory</div>
        <h1>
          Universities &amp; <span className="green">scholarships</span>,
          <br />
          all in one clean list.
        </h1>
        <p>
          147 globally recognised universities and 39 scholarships across 11 countries. Search,
          filter by country, and go straight to the official page — no agent needed to see any of
          this.
        </p>
        <div className="usd-hero-stats">
          <div className="usd-stat">
            <h3>147</h3>
            <p>Universities listed</p>
          </div>
          <div className="usd-stat">
            <h3>39</h3>
            <p>Scholarships listed</p>
          </div>
          <div className="usd-stat">
            <h3>11</h3>
            <p>Countries covered</p>
          </div>
        </div>
      </section>

      <section className="usd-section">
        <div className="usd-section-title">
          <h2>Before you start applying</h2>
          <p>Read this first — five minutes now saves months of missed deadlines later.</p>
        </div>
        <div className="usd-container usd-narrow">
          <div className="usd-guide-grid">
            {GUIDE_CARDS.map((card) => (
              <div key={card.title} className="usd-guide-card">
                <h4>{card.title}</h4>
                {card.body}
              </div>
            ))}
          </div>
          <div className="usd-guide-note">
            University lists reflect globally recognised (tier-one) institutions. Scholarship
            deadlines and amounts shown are for the 2026–27 cycle and can change — always confirm on
            the official website before applying.
          </div>
        </div>
      </section>

      <section className="usd-section usd-alt" id="scholarships-table">
        <div className="usd-section-title">
          <h2>Scholarships</h2>
          <p>Filter by country, check the deadline, and see what each award covers</p>
        </div>
        <div className="usd-list-toolbar">
          <div className="usd-filter-bar">
            <FilterPills
              countries={SCH_COUNTRIES}
              active={schCountry}
              onSelect={(country) => {
                setSchCountry(country);
                setSchPage(1);
              }}
            />
            <input
              type="search"
              className="usd-search-input"
              value={schQuery}
              onChange={(e) => setSchQuery(e.target.value)}
              placeholder="Search scholarship name..."
              aria-label="Search scholarships"
            />
          </div>
          <p className="usd-result-count">
            {filteredSchs.length === 0
              ? `0 of ${SCHOLARSHIPS.length} scholarships`
              : `Showing ${schRangeStart}–${schRangeEnd} of ${filteredSchs.length} scholarships`}
          </p>
        </div>

        <div className="usd-table-wrap usd-sch-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Scholarship</th>
                <th>Provider</th>
                <th>Level</th>
                <th>Covers</th>
                <th>Who it&apos;s for</th>
                <th>Deadline (2026–27)</th>
              </tr>
            </thead>
            <tbody>
              {pagedSchs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="usd-empty-cell">
                    No scholarships match your filters.
                  </td>
                </tr>
              ) : (
                pagedSchs.map((s) => (
                  <tr key={`${s.country}-${s.name}`}>
                    <td>
                      <span className="usd-country-badge">{s.country}</span>
                    </td>
                    <td className="usd-cell-name">{s.name}</td>
                    <td>{s.provider}</td>
                    <td className="usd-cell-muted">{s.level}</td>
                    <td>{s.covers}</td>
                    <td>{s.who}</td>
                    <td className="usd-cell-muted">{s.deadline}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredSchs.length > PAGE_SIZE && (
          <div className="usd-pagination">
            <button
              type="button"
              className="usd-page-btn"
              onClick={() => goToSchPage(safeSchPage - 1)}
              disabled={safeSchPage <= 1}
            >
              Previous
            </button>
            <div className="usd-page-numbers" role="navigation" aria-label="Scholarships pagination">
              {Array.from({ length: schTotalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`usd-page-num${safeSchPage === page ? ' active' : ''}`}
                  onClick={() => goToSchPage(page)}
                  aria-current={safeSchPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="usd-page-btn"
              onClick={() => goToSchPage(safeSchPage + 1)}
              disabled={safeSchPage >= schTotalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>

      <section className="usd-section" id="universities-table">
        <div className="usd-section-title">
          <h2>Universities</h2>
          <p>Filter by country or search by name</p>
        </div>
        <div className="usd-list-toolbar">
          <div className="usd-filter-bar">
            <FilterPills
              countries={UNI_COUNTRIES}
              active={uniCountry}
              onSelect={(country) => {
                setUniCountry(country);
                setUniPage(1);
              }}
            />
            <input
              type="search"
              className="usd-search-input"
              value={uniQuery}
              onChange={(e) => setUniQuery(e.target.value)}
              placeholder="Search university or city..."
              aria-label="Search universities"
            />
          </div>
          <p className="usd-result-count">
            {filteredUnis.length === 0
              ? `0 of ${UNIVERSITIES.length} universities`
              : `Showing ${uniRangeStart}–${uniRangeEnd} of ${filteredUnis.length} universities`}
          </p>
        </div>

        <div className="usd-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>University</th>
                <th>City / Location</th>
                <th>Type</th>
                <th>Notable / Flagship Scholarships</th>
              </tr>
            </thead>
            <tbody>
              {pagedUnis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="usd-empty-cell">
                    No universities match your filters.
                  </td>
                </tr>
              ) : (
                pagedUnis.map((u) => (
                  <tr key={`${u.country}-${u.name}`}>
                    <td>
                      <span className="usd-country-badge">{u.country}</span>
                    </td>
                    <td className="usd-cell-name">{u.name}</td>
                    <td className="usd-cell-location">{u.location}</td>
                    <td>
                      <span className="usd-type-badge">{u.type}</span>
                    </td>
                    <td className="usd-cell-scholarships">{u.scholarships}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredUnis.length > PAGE_SIZE && (
          <div className="usd-pagination">
            <button
              type="button"
              className="usd-page-btn"
              onClick={() => goToUniPage(safeUniPage - 1)}
              disabled={safeUniPage <= 1}
            >
              Previous
            </button>
            <div className="usd-page-numbers" role="navigation" aria-label="Universities pagination">
              {Array.from({ length: uniTotalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`usd-page-num${safeUniPage === page ? ' active' : ''}`}
                  onClick={() => goToUniPage(page)}
                  aria-current={safeUniPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="usd-page-btn"
              onClick={() => goToUniPage(safeUniPage + 1)}
              disabled={safeUniPage >= uniTotalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>

      <section className="usd-section" id="book-session-form">
        <div className="usd-section-title">
          <h2>Share your details</h2>
          <p>
            Fill in your profile so we can help shortlist universities and scholarships that fit
            your grades, budget, and timeline.
          </p>
        </div>

        <form className="usd-form-box" onSubmit={handleSubmit} key={formKey}>
          <div className="usd-form-head">
            <h3>Enquiry form</h3>
            <p>Tell us about yourself — our team will follow up with suitable options.</p>
          </div>

          <div className="usd-form-section">
            <h4>Personal details</h4>
            <div className="usd-form-row">
              <div className="usd-form-group">
                <label htmlFor="usd-name">
                  Full name <span className="req">*</span>
                </label>
                <input
                  id="usd-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="usd-form-group">
                <label htmlFor="usd-phone">
                  Phone / WhatsApp <span className="req">*</span>
                </label>
                <input
                  id="usd-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div className="usd-form-row">
              <div className="usd-form-group">
                <label htmlFor="usd-email">
                  Email address <span className="req">*</span>
                </label>
                <input
                  id="usd-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="usd-form-group">
                <label htmlFor="usd-age">
                  Age <span className="req">*</span>
                </label>
                <input
                  id="usd-age"
                  type="number"
                  min="14"
                  max="60"
                  value={form.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  placeholder="e.g. 22"
                  required
                />
              </div>
            </div>

            <div className="usd-form-group">
              <label htmlFor="usd-address">
                Address / City / State <span className="req">*</span>
              </label>
              <input
                id="usd-address"
                type="text"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Your city, state, country"
                required
              />
            </div>
          </div>

          <div className="usd-form-section">
            <h4>Education &amp; profile</h4>
            <div className="usd-form-row">
              <div className="usd-form-group">
                <label htmlFor="usd-education">
                  Highest education <span className="req">*</span>
                </label>
                <CustomSelect
                  id="usd-education"
                  className="usd-custom-select"
                  value={form.education}
                  onChange={(e) => updateField('education', e.target.value)}
                  options={EDUCATION_OPTIONS}
                  placeholder="Select education"
                  required
                />
              </div>
              <div className="usd-form-group">
                <label htmlFor="usd-status">
                  Current status <span className="req">*</span>
                </label>
                <CustomSelect
                  id="usd-status"
                  className="usd-custom-select"
                  value={form.currentStatus}
                  onChange={(e) => updateField('currentStatus', e.target.value)}
                  options={STATUS_OPTIONS}
                  placeholder="Select status"
                  required
                />
              </div>
            </div>

            <div className="usd-form-group">
              <label htmlFor="usd-skills">Skills / trade (if any)</label>
              <input
                id="usd-skills"
                type="text"
                value={form.skills}
                onChange={(e) => updateField('skills', e.target.value)}
                placeholder="e.g. IELTS 7.0, coding, accounting..."
              />
            </div>
          </div>

          <div className="usd-form-section">
            <h4>Study abroad preferences</h4>
            <div className="usd-form-group">
              <label htmlFor="usd-countries">
                Preferred countries <span className="req">*</span>
              </label>
              <input
                id="usd-countries"
                type="text"
                value={form.preferredCountries}
                onChange={(e) => updateField('preferredCountries', e.target.value)}
                placeholder="e.g. Australia, Canada, UK"
                required
              />
            </div>

            <div className="usd-form-row">
              <div className="usd-form-group">
                <label htmlFor="usd-budget">
                  Budget <span className="req">*</span>
                </label>
                <CustomSelect
                  id="usd-budget"
                  className="usd-custom-select"
                  value={form.budget}
                  onChange={(e) => updateField('budget', e.target.value)}
                  options={BUDGET_OPTIONS}
                  placeholder="Select budget range"
                  required
                />
              </div>
              <div className="usd-form-group">
                <label htmlFor="usd-timeline">
                  Timeline <span className="req">*</span>
                </label>
                <CustomSelect
                  id="usd-timeline"
                  className="usd-custom-select"
                  value={form.timeline}
                  onChange={(e) => updateField('timeline', e.target.value)}
                  options={TIMELINE_OPTIONS}
                  placeholder="Select timeline"
                  required
                />
              </div>
            </div>

            <div className="usd-form-group usd-form-group-last">
              <label htmlFor="usd-notes">Anything specific you want to discuss?</label>
              <textarea
                id="usd-notes"
                rows={4}
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Preferred course, grades/CGPA, scholarship goals, questions..."
              />
            </div>
          </div>

          <div className="usd-payment-summary">
            <span>Universities &amp; Scholarships session</span>
            <strong>Rs.{SCHOLARSHIP_SESSION_PRICE}</strong>
          </div>

          <button type="submit" className="usd-submit-btn" disabled={submitting}>
            {submitting ? 'Opening payment...' : `Pay Rs.${SCHOLARSHIP_SESSION_PRICE} & Book Session`}
          </button>
          <p className="usd-form-note">
            Secure payment via Razorpay. After payment, our team will connect with you within 24 hours.
          </p>
        </form>
      </section>

      <SiteFooter />
    </div>
  );
};

export default UniversitiesScholarships;
