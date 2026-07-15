export const STUDY_ABROAD_BASE_SECTIONS = [
  {
    title: 'Academic credentials',
    docs: [
      'Consolidated memorandum of grades / consolidated transcript',
      'Provisional certificate or final degree certificate',
      'Individual semester-wise marksheets (all semesters)',
      '10th standard marksheet/certificate',
      '12th standard marksheet/certificate',
    ],
  },
  {
    title: 'English language proficiency',
    docs: [
      'IELTS / PTE Academic / TOEFL / Duolingo score report',
      'Medium of Instruction (MOI) certificate from your university (where the destination accepts it in place of a test)',
    ],
  },
  {
    title: 'Personal & identity records',
    docs: [
      'International passport (all pages, colour scan)',
      "Passport-size photographs (per destination's exact visa photo specification)",
      'Birth certificate',
    ],
  },
  {
    title: 'Financial & sponsorship documents',
    docs: [
      'Bank statements / proof of funds (last 3–6 months)',
      "Education loan sanction letter, or sponsor's affidavit of support",
      "Sponsor's income tax returns and salary slips (if self-funded by family)",
      'Scholarship or fee waiver letter (if applicable)',
    ],
  },
  {
    title: 'Application strategy documents',
    docs: [
      'Statement of Purpose (SOP)',
      'Updated professional resume / CV',
      'Letters of Recommendation (academic and/or professional)',
      'Offer letter / Letter of Acceptance from the university (once received)',
    ],
  },
];

export const STUDY_ABROAD_COUNTRY_DOCS = {
  Australia: [
    'Genuine Student (GS) requirement responses (replaced the GTE statement in March 2024 — answered as questions in the visa application, not a separate essay)',
    'Confirmation of Enrolment (CoE) once issued',
    'Overseas Student Health Cover (OSHC) confirmation',
  ],
  'New Zealand': [
    'Offer of Place from the institution',
    "Evidence of funds meeting Immigration New Zealand's requirements",
    'Medical examination / chest X-ray certificate (if required for your course length)',
  ],
  Malaysia: [
    'Pre-arrival medical examination report (EMGS-approved clinic, or Pre-VAL Medical Report if done elsewhere)',
    'Visa Approval Letter (VAL) once issued by EMGS',
    'Insurance confirmation (EMGS-compliant)',
  ],
  Singapore: [
    "Student's Pass application (eForm 16) once submitted by the institution",
    'ICA-compliant passport photo',
    'Proof of financial capacity per ICA guidelines',
  ],
  'UAE / Dubai': [
    'MOFA-attested academic documents',
    'Attested birth certificate',
    'Health insurance confirmation',
  ],
  USA: [
    'Form I-20 (issued after acceptance)',
    'SEVIS I-901 fee payment receipt',
    'DS-160 online application confirmation page',
    'Financial affidavit of support / sponsor documentation for the visa interview',
  ],
  Germany: [
    'APS certificate (mandatory academic evaluation for Indian applicants — required before a visa appointment can be booked)',
    'Blocked account (Sperrkonto) proof or formal financial obligation letter',
    'University application portal (uni-assist) confirmation, where applicable',
  ],
  Poland: [
    'Apostilled / legalised academic documents',
    'Proof of accommodation in Poland',
    'Travel and health insurance confirmation',
  ],
  Switzerland: [
    'Proof of sufficient funds for the full study duration',
    'Confirmed accommodation',
    'Motivation letter (separate from the SOP, if requested by the institution)',
  ],
  Italy: [
    'Declaration of Value (Dichiarazione di Valore) for academic documents',
    'Universitaly portal pre-enrolment confirmation',
    'Proof of accommodation in Italy',
  ],
};

export const STUDY_ABROAD_COUNTRIES = Object.keys(STUDY_ABROAD_COUNTRY_DOCS);

export const getStudyAbroadSections = (country) => {
  const sections = STUDY_ABROAD_BASE_SECTIONS.map((s) => ({
    title: s.title,
    docs: [...s.docs],
  }));
  if (country && STUDY_ABROAD_COUNTRY_DOCS[country]) {
    sections.push({
      title: `${country} — additional requirements`,
      docs: [...STUDY_ABROAD_COUNTRY_DOCS[country]],
    });
  }
  return sections;
};

export const getAllStudyAbroadDocs = (country) =>
  getStudyAbroadSections(country).flatMap((s) => s.docs);

export const STUDY_ABROAD_FINANCIAL_NOTES = {
  Australia:
    "As of 2026, the Department's living-cost benchmark for a single student sits roughly in the AUD 24,500–29,700 range depending on the source you check, plus your first year's tuition and around AUD 2,500–3,000 for travel. Funds need a genuine, traceable holding history — a lump sum deposited right before you apply invites extra scrutiny. Confirm the exact current figure on the Department of Home Affairs site before finalising.",
  'New Zealand':
    'Immigration NZ requires NZD 20,000 per year of study (or NZD 1,667/month for courses under a year), on top of tuition and outward travel costs. Large single deposits need a documented, explainable source.',
  Malaysia:
    "EMGS typically expects funds covering roughly a year of tuition and living costs (commonly cited around US$12,700), plus a refundable Personal Bond (roughly US$160–640 depending on nationality and course). Bond amounts vary — confirm the current figure with EMGS or your university.",
  Singapore:
    'Published thresholds vary by source and change — treat any number you see online as indicative only, and confirm the current expectation directly with ICA or your institution before relying on it.',
  'UAE / Dubai':
    "Requirements vary by emirate and institution — there's no single published national figure, so this needs to be confirmed directly with your university's admissions office.",
  USA: "There's no fixed government number here — the amount you must prove is whatever your specific school states as its estimated cost of attendance on your Form I-20 (tuition plus a standard living allowance). That's why this can't be finalised until the I-20 is issued.",
  Germany:
    "As of 2026, a blocked account (Sperrkonto) needs €11,904 for the year, released at roughly €992/month. This is tied to Germany's BAföG living-cost benchmark and is revised periodically — confirm the current figure before funding the account.",
  Poland:
    "There isn't one widely quoted figure for the national student visa the way short-stay Schengen visas have a per-day amount — the consulate assesses whether your combined tuition and living-cost evidence is credible for your situation. Confirm current expectations with the Polish consulate handling your application.",
  Switzerland:
    "Cantons vary, but CHF 21,000 per academic year is the commonly cited threshold (some cantons, like Zurich and Geneva, ask for more), on top of mandatory health insurance (roughly CHF 300–400/month). This isn't set nationally — confirm with the specific canton's migration office.",
  Italy:
    'Italy assesses funds against national minimum subsistence levels rather than one round number, and figures circulating online vary. This specifically needs confirmation from the Italian consulate handling your visa, not just general guidance.',
};

export const STUDY_ABROAD_COUNTRY_EXTRAS = {
  Australia: [
    {
      name: 'Genuine Student (GS) requirement responses',
      why: 'Replaced the GTE statement in March 2024 — now answered as targeted questions inside the visa application itself, not a separate essay.',
    },
    {
      name: 'Confirmation of Enrolment (CoE)',
      why: 'Issued once you accept your offer and pay the required deposit — the visa application can’t be lodged without it.',
    },
    {
      name: 'Overseas Student Health Cover (OSHC)',
      why: 'Mandatory health insurance for the length of your student visa; proof of an active policy is required at lodgement.',
    },
  ],
  'New Zealand': [
    {
      name: 'Offer of Place',
      why: 'Formal confirmation of enrolment, required before the student visa can be lodged.',
    },
    {
      name: 'Medical examination / chest X-ray',
      why: 'Required for some course lengths and nationalities to confirm you don’t pose a public health risk.',
    },
  ],
  Malaysia: [
    {
      name: 'Pre-arrival medical examination report',
      why: 'EMGS won’t process your Visa Approval Letter without this.',
    },
    {
      name: 'Visa Approval Letter (VAL)',
      why: 'Issued by EMGS once your application clears — used to apply for the actual entry visa.',
    },
    {
      name: 'EMGS-compliant insurance confirmation',
      why: 'Must meet EMGS’s specific policy standards, not just any travel insurance.',
    },
  ],
  Singapore: [
    {
      name: "Student's Pass application (eForm 16)",
      why: 'Submitted by your institution on your behalf once you accept your offer.',
    },
    {
      name: 'ICA-compliant passport photo',
      why: 'ICA has its own strict photo spec, separate from your passport photo — a common rejection reason.',
    },
  ],
  'UAE / Dubai': [
    {
      name: 'MOFA-attested academic documents',
      why: 'UAE institutions and immigration require attestation before documents are accepted.',
    },
    {
      name: 'Attested birth certificate',
      why: 'Same attestation requirement as academic documents.',
    },
  ],
  USA: [
    {
      name: 'Form I-20',
      why: 'Issued by your school after acceptance — the single most important document for your F-1 visa.',
    },
    {
      name: 'SEVIS I-901 fee receipt',
      why: 'Required before your visa interview can be scheduled.',
    },
    {
      name: 'DS-160 confirmation page',
      why: 'Confirms you’ve completed the formal visa application; brought to your interview.',
    },
  ],
  Germany: [
    {
      name: 'APS certificate',
      why: 'Mandatory since November 2022 for Indian applicants — you cannot book a visa appointment without it.',
    },
    {
      name: 'uni-assist confirmation',
      why: 'Some visa offices ask to see this alongside your admission letter.',
    },
  ],
  Poland: [
    {
      name: 'Apostilled academic documents',
      why: 'A plain notarised copy usually isn’t sufficient.',
    },
    {
      name: 'Proof of accommodation',
      why: 'Checked as part of assessing whether your stay is genuinely planned and funded.',
    },
  ],
  Switzerland: [
    {
      name: 'Confirmed accommodation',
      why: 'Cantonal migration offices generally want this before granting a residence permit.',
    },
    {
      name: 'Motivation letter',
      why: 'Some institutions require this separately from your SOP.',
    },
  ],
  Italy: [
    {
      name: 'Declaration of Value (Dichiarazione di Valore)',
      why: 'Official assessment of what your foreign degree equates to in the Italian system.',
    },
    {
      name: 'Universitaly portal pre-enrolment',
      why: 'Required before a visa application can proceed at most Italian universities.',
    },
  ],
};

export const STUDY_ABROAD_WHY_SECTIONS = [
  {
    title: 'Academic credentials',
    items: [
      {
        name: 'Consolidated transcript',
        why: 'Proves you actually completed the required credits — universities check this against your claimed degree before anything else.',
      },
      {
        name: 'Provisional or final degree certificate',
        why: 'Confirms the degree was actually awarded, not just in progress. A transcript alone doesn’t prove completion.',
      },
      {
        name: 'Semester-wise marksheets',
        why: 'Shows consistent performance across your whole degree, not just the final result — some universities check for large gaps or drops.',
      },
      {
        name: '10th & 12th certificates',
        why: 'Verifies your date of birth, earliest academic record, and that your academic timeline is continuous.',
      },
    ],
  },
  {
    title: 'English language proficiency',
    items: [
      {
        name: 'IELTS / PTE / TOEFL / Duolingo score',
        why: 'Universities and visa offices need independent proof you can study in English — self-reported fluency isn’t accepted as evidence.',
      },
      {
        name: 'Medium of Instruction (MOI) certificate',
        why: 'Some institutions accept this instead of a test if your whole degree was taught in English. Not every university or visa category accepts it — confirm before skipping a language test on the strength of this alone.',
      },
    ],
  },
  {
    title: 'Personal & identity records',
    items: [
      {
        name: 'Passport',
        why: 'Your core identity document for the university application, the visa application, and eventual travel.',
      },
      {
        name: 'Passport-size photographs',
        why: 'Each country has its own exact size and background spec — photos that don’t match get applications kicked back.',
      },
      {
        name: 'Birth certificate',
        why: 'Confirms identity and age independently of your passport; several destinations require it for the student pass itself.',
      },
    ],
  },
];

export const STUDY_ABROAD_FINANCIAL_WHY = [
  {
    name: 'Why this section exists',
    why: 'Every destination needs proof you (or your sponsor) can afford tuition and living costs for the full course. Without it, visa officers assume you might need to work illegally or won’t be able to support yourself — this is one of the most common rejection points across every country below.',
  },
  {
    name: 'Bank statements / proof of funds',
    why: 'See the country selector below — the required amount and format is different in every destination.',
  },
  {
    name: "Loan sanction letter or sponsor's affidavit",
    why: 'If the money isn’t yours, the visa office needs to see who’s paying and their relationship to you — proves the sponsorship is real, not funds borrowed to pad a bank statement.',
  },
  {
    name: "Sponsor's ITR and salary slips",
    why: 'Shows the sponsor actually earns enough to plausibly fund your study, not just that they have a lump sum sitting in an account right now.',
  },
  {
    name: 'Scholarship or fee waiver letter',
    why: 'Reduces how much personal or sponsor funding you need to prove — but only if it’s documented, not just claimed.',
  },
];

export const STUDY_ABROAD_STRATEGY_WHY = [
  {
    name: 'Statement of Purpose (SOP)',
    why: 'Where admissions — and for many countries, the visa officer too — assess whether your motivations are genuine and consistent with your background. Weak or generic SOPs are one of the most common rejection reasons.',
  },
  {
    name: 'Resume / CV',
    why: 'Shows practical readiness — relevant projects, tools, internships — that grades alone don’t convey.',
  },
  {
    name: 'Letters of Recommendation',
    why: 'Third-party validation of your ability, required by most universities as part of holistic admission review.',
  },
  {
    name: 'Offer letter / Letter of Acceptance',
    why: 'Everything downstream — CoE, I-20, visa application — depends on this.',
  },
];
