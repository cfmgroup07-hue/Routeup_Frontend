import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import {
  UNIVERSITIES,
  SCHOLARSHIPS,
  UNI_COUNTRIES,
  SCH_COUNTRIES,
} from '../data/universitiesScholarships';
import './UniversitiesScholarships.css';

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

function siteHref(site) {
  if (!site || site.toLowerCase().startsWith('see ')) return null;
  return site.startsWith('http') ? site : `https://${site}`;
}

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
  const navigate = useNavigate();
  const [uniCountry, setUniCountry] = useState('All');
  const [uniQuery, setUniQuery] = useState('');
  const [schCountry, setSchCountry] = useState('All');
  const [schQuery, setSchQuery] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Universities & Scholarships Directory 2026–27 | RouteUp';
    return () => {
      document.title = 'RouteUp';
    };
  }, []);

  const filteredUnis = useMemo(() => {
    const q = uniQuery.trim().toLowerCase();
    return UNIVERSITIES.filter(
      (u) =>
        (uniCountry === 'All' || u.country === uniCountry) &&
        (!q || u.name.toLowerCase().includes(q) || u.location.toLowerCase().includes(q))
    );
  }, [uniCountry, uniQuery]);

  const filteredSchs = useMemo(() => {
    const q = schQuery.trim().toLowerCase();
    return SCHOLARSHIPS.filter(
      (s) =>
        (schCountry === 'All' || s.country === schCountry) &&
        (!q || s.name.toLowerCase().includes(q))
    );
  }, [schCountry, schQuery]);

  const goBookSession = (e) => {
    e.preventDefault();
    navigate('/', { hash: 'book' });
    setTimeout(() => {
      document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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

      <section className="usd-section usd-alt">
        <div className="usd-section-title">
          <h2>Universities</h2>
          <p>Filter by country or search by name</p>
        </div>
        <div className="usd-filter-bar">
          <FilterPills countries={UNI_COUNTRIES} active={uniCountry} onSelect={setUniCountry} />
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
          {filteredUnis.length} of {UNIVERSITIES.length} universities
        </p>
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
              {filteredUnis.map((u) => (
                <tr key={`${u.country}-${u.name}`}>
                  <td className="usd-cell-country">{u.country}</td>
                  <td className="usd-cell-name">{u.name}</td>
                  <td>{u.location}</td>
                  <td className="usd-cell-muted">{u.type}</td>
                  <td>{u.scholarships}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="usd-section">
        <div className="usd-section-title">
          <h2>Scholarships</h2>
          <p>Filter by country, check the deadline, click through to the official page</p>
        </div>
        <div className="usd-filter-bar">
          <FilterPills countries={SCH_COUNTRIES} active={schCountry} onSelect={setSchCountry} />
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
          {filteredSchs.length} of {SCHOLARSHIPS.length} scholarships
        </p>
        <div className="usd-table-wrap">
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
                <th>Official site</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchs.map((s) => {
                const href = siteHref(s.site);
                return (
                  <tr key={`${s.country}-${s.name}`}>
                    <td className="usd-cell-country">{s.country}</td>
                    <td className="usd-cell-name">{s.name}</td>
                    <td>{s.provider}</td>
                    <td className="usd-cell-muted">{s.level}</td>
                    <td>{s.covers}</td>
                    <td>{s.who}</td>
                    <td className="usd-cell-muted">{s.deadline}</td>
                    <td>
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          {s.site} ↗
                        </a>
                      ) : (
                        <span className="usd-cell-muted">{s.site}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="usd-section usd-alt">
        <div className="usd-cta-box">
          <h3>Not sure which of these fit your profile?</h3>
          <p>
            147 universities and 39 scholarships is a lot to narrow down alone. Book a session and
            we&apos;ll help you shortlist against your grades, budget, and timeline.
          </p>
          <a href="/#book" onClick={goBookSession}>
            Book a session
          </a>
          <Link to="/study-abroad-documents" className="usd-cta-secondary">
            Upload study abroad documents
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default UniversitiesScholarships;
