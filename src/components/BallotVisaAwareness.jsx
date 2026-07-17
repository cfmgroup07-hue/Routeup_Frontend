import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import './BallotVisaAwareness.css';
import { ExternalLink, Check, AlertTriangle, AlertCircle, ArrowUpRight } from 'lucide-react';

const BallotVisaAwareness = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleBookRedirect = (e) => {
    e.preventDefault();
    navigate('/', { hash: 'book' });
    setTimeout(() => {
      const el = document.getElementById('book');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="ballot-page">
      {/* NAVBAR */}
      <SiteNavbar active="ballot-awareness" />

      {/* HERO */}
      <section className="ballot-hero">
        <div className="hero-badge">Scam Awareness</div>
        <h1>
          &quot;Ballot visas&quot; aren&apos;t a visa type.
          <br />
          They&apos;re a <span className="red">lottery</span> — and that&apos;s exactly what gets sold to you.
        </h1>
        <p>
          UK, Australia, and US programmes for young Indians are being marketed by agents and influencers 
          as something you can pay to guarantee. You can&apos;t. Here&apos;s what each scheme actually is, 
          what it actually costs, and how the DM pitch works.
        </p>
      </section>

      {/* WHAT IS A BALLOT */}
      <section className="ballot-section">
        <div className="ballot-container narrow">
          <div className="explainer-box">
            <p>
              <strong>A &quot;ballot visa&quot; isn&apos;t a category of visa — it&apos;s how a handful of government 
              migration programmes allocate a small number of places when far more people are eligible than 
              there is room for.</strong> Instead of first-come-first-served or highest-points-wins, applicants 
              are entered into a random draw. Winning the draw doesn&apos;t grant the visa either — it just gives 
              you the right to submit a full application, which is then assessed normally.
            </p>
            <p>
              Because entry is random, <strong>nobody — no agent, no consultant, no influencer — can improve 
              your odds or guarantee a result.</strong> The entire business model of anyone charging you to 
              &quot;secure your ballot spot&quot; depends on you not knowing that the government&apos;s own registration 
              is free, and that selection is chance, not merit or payment.
            </p>
          </div>
        </div>
      </section>

      {/* SCHEME CARDS */}
      <section className="ballot-section alt">
        <div className="ballot-section-title">
          <h2>The actual programmes behind the pitch</h2>
          <p>What each one really is, current as of July 2026</p>
        </div>
        <div className="ballot-container">
          <div className="scheme-grid">

            <div className="scheme-card">
              <div className="scheme-flag">🇬🇧</div>
              <h3>UK — India Young Professionals Scheme</h3>
              <div className="scheme-sub">Youth Mobility Scheme, India-specific ballot</div>
              <div className="stat-row">
                <span className="scheme-pill">Free to enter</span>
                <span className="scheme-pill">3,000 places/year</span>
              </div>
              <p>
                <strong>Eligibility:</strong> Indian citizen, aged 18–30, bachelor&apos;s degree or above, 
                £2,530 in savings (which you keep — it&apos;s not a fee), no dependent children under 18, 
                haven&apos;t used this scheme or the Youth Mobility Scheme before.
              </p>
              <p>
                <strong>Real cost, if selected:</strong> £340 application fee + £1,552 healthcare surcharge 
                (£1,892 total) — paid directly to UKVI, not to any agent.
              </p>
              <p>
                <strong>2026 ballot:</strong> Opens 21 July, closes 23 July (India time). Entry needs only your 
                name, date of birth, passport scan, phone, and email — no supporting documents at entry stage.
              </p>
              <a 
                className="official-link" 
                href="https://www.gov.uk/guidance/india-young-professionals-scheme-visa-ballot-system" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Official GOV.UK page <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="scheme-card">
              <div className="scheme-flag">🇦🇺</div>
              <h3>Australia — MATES Scheme</h3>
              <div className="scheme-sub">Subclass 403, India-specific ballot</div>
              <div className="stat-row">
                <span className="scheme-pill">A$25 ballot fee</span>
                <span className="scheme-pill">3,000 places/year</span>
              </div>
              <p>
                <strong>Eligibility:</strong> Indian citizen, 30 or under at registration, bachelor&apos;s 
                degree or higher completed within the last 2 years, in an eligible field — ICT, AI, engineering, 
                fintech, renewable energy, or agtech — plus IELTS 6.0 overall (min 5.0 per band) or equivalent.
              </p>
              <p>
                <strong>Real cost, if selected:</strong> A$25 to enter the ballot, A$365 visa application 
                charge if invited — paid directly to the Australian Department of Home Affairs.
              </p>
              <p>
                <strong>Not open to everyone:</strong> only the specific fields listed above qualify. If 
                someone offers to get you into MATES outside these fields, that alone is a red flag.
              </p>
              <a 
                className="official-link" 
                href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-work-403/mates" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Official Home Affairs page <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="scheme-card excluded">
              <div className="scheme-flag">🇺🇸</div>
              <h3>USA — Green Card / Diversity Visa Lottery</h3>
              <div className="scheme-sub">DV Program, free federal registration</div>
              <div className="stat-row">
                <span className="scheme-pill">Free to enter</span>
                <span className="scheme-pill warn">India generally excluded</span>
              </div>
              <p>
                <strong>The part almost nobody selling this tells you:</strong> India is currently on the 
                DV Program&apos;s <em>ineligible</em> country list — countries that sent 50,000+ immigrants to the US 
                in the prior 5 years are excluded, and India is one of them. If you were born in India and neither 
                your spouse nor a parent was born in an eligible country, you generally cannot enter at all, 
                no matter what you pay anyone.
              </p>
              <p>
                <strong>The narrow exception:</strong> chargeability — you may be able to claim eligibility 
                through a parent&apos;s or spouse&apos;s country of birth if it&apos;s on the eligible list. This needs 
                to be checked against your actual documents, not assumed.
              </p>
              <p>
                <strong>If eligible:</strong> registration is entirely free, done directly on the official 
                US government site during the annual entry window.
              </p>
              <a 
                className="official-link" 
                href="https://travel.state.gov/content/travel/en/us-visas/immigrate/diversity-visa-program-entry.html" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Official travel.state.gov page <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="scheme-card excluded">
              <div className="scheme-flag">🇳🇿</div>
              <h3>New Zealand — Working Holiday for India</h3>
              <div className="scheme-sub">Announced, not yet operating</div>
              <div className="stat-row">
                <span className="scheme-pill warn">Not launched yet</span>
                <span className="scheme-pill">1,000 places/year (planned)</span>
              </div>
              <p>
                <strong>Where this actually stands:</strong> the India–New Zealand Free Trade Agreement, 
                signed 27 April 2026, commits NZ to offering 1,000 Working Holiday Visas a year to Indian citizens 
                aged 18–30. The detailed visa rules are still being finalised, with a working scheme expected 
                mid-to-late 2026 at the earliest.
              </p>
              <p>
                <strong>The red flag this creates:</strong> if anyone is currently charging you to &quot;register 
                early,&quot; &quot;reserve a spot,&quot; or &quot;guarantee selection&quot; for this visa, they&apos;re 
                ahead of the New Zealand government itself — there&apos;s no live application process to sell access to yet.
              </p>
              <p>
                Separately: New Zealand&apos;s RSE seasonal worker scheme and Australia&apos;s PALM seasonal worker 
                scheme are both for specific Pacific Island nations and Timor-Leste — <strong>neither currently 
                includes India.</strong> An &quot;Australia or New Zealand seasonal work visa ballot&quot; pitched to Indian 
                applicants outside the MATES/Working Holiday schemes above is not a real government programme.
              </p>
              <a 
                className="official-link" 
                href="https://www.immigration.govt.nz/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Immigration New Zealand <ArrowUpRight size={14} />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* HOW THE SCAM WORKS */}
      <section className="ballot-section">
        <div className="ballot-section-title">
          <h2>How the influencer pitch actually works</h2>
          <p>The pattern is close to identical across all four programmes above</p>
        </div>
        <div className="ballot-container">
          <div className="redflag-list">
            <div className="redflag-card">
              <h4>It starts with a DM, not a comment</h4>
              <p>The public post is vague and aspirational (&quot;Move to the UK in 2026!&quot;). The actual pitch — price, &quot;guarantee,&quot; payment link — only comes once you message them privately. Public accountability is avoided on purpose.</p>
            </div>
            <div className="redflag-card">
              <h4>&quot;I&apos;ll guarantee your selection&quot;</h4>
              <p>No one can do this. These are random draws run by foreign governments. Anyone claiming to influence odds is either lying or planning to disappear once the ballot closes and blame &quot;bad luck.&quot;</p>
            </div>
            <div className="redflag-card">
              <h4>Payment before any result</h4>
              <p>Legitimate fees are only ever paid after you&apos;re selected, directly to the government (UKVI, Home Affairs, USCIS/State Department, Immigration NZ) — never to a personal UPI ID, WhatsApp number, or &quot;processing agent&quot; before you know the outcome.</p>
            </div>
            <div className="redflag-card">
              <h4>Selling access to something not open yet</h4>
              <p>Like the New Zealand example above — if the scheme hasn&apos;t officially launched, there is nothing real to register you for. Early &quot;priority list&quot; fees are pure invention.</p>
            </div>
            <div className="redflag-card">
              <h4>Skipping eligibility entirely</h4>
              <p>Genuine confusion, not just cost, is the bigger risk here. Someone ineligible for the DV lottery (most Indian-born applicants) or outside MATES&apos; specific fields can pay in full and never had a real chance — the money is gone regardless of the draw.</p>
            </div>
            <div className="redflag-card">
              <h4>Harvesting your documents</h4>
              <p>Ballot entry only ever needs basic details (name, DOB, passport scan, contact info). Anyone asking for full financial documents, family details, or upfront &quot;processing packages&quot; before a ballot has even opened is collecting data or money for its own sake.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY CHECKLIST */}
      <section className="ballot-section alt">
        <div className="checklist-box">
          <h3>✅ Before you pay anyone for a &quot;ballot visa&quot;</h3>
          <div className="checklist-items">
            <div className="checklist-item">
              <span className="check">✓</span>
              <span>Check the scheme is actually live — not &quot;coming soon&quot; or FTA-announced only</span>
            </div>
            <div className="checklist-item">
              <span className="check">✓</span>
              <span>Enter the ballot yourself, directly on the government&apos;s official site</span>
            </div>
            <div className="checklist-item">
              <span className="check">✓</span>
              <span>Confirm you actually meet the eligibility criteria before entering anything</span>
            </div>
            <div className="checklist-item">
              <span className="check">✓</span>
              <span>Never pay before a result is announced — ballot entry itself is free everywhere above</span>
            </div>
            <div className="checklist-item">
              <span className="check">✓</span>
              <span>Pay official fees only through the government&apos;s own payment portal, never a personal account</span>
            </div>
            <div className="checklist-item">
              <span className="check">✓</span>
              <span>Be suspicious of anyone who moves the conversation to DM before explaining anything publicly</span>
            </div>
          </div>
        </div>

        <div className="cta-box">
          <h3>Not sure if something you&apos;ve been offered is real?</h3>
          <p>Send us what you&apos;ve been told before you pay anyone. We&apos;ll tell you straight whether it matches the actual scheme — no charge for that conversation.</p>
          <a href="/#book" onClick={handleBookRedirect} className="cta-btn">Talk to RouteUp</a>
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter />
    </div>
  );
};

export default BallotVisaAwareness;
