export const PR_COUNTRIES = [
  'India', 'Philippines', 'China', 'Nepal', 'Pakistan', 'Sri Lanka', 'Bangladesh',
  'Vietnam', 'Indonesia', 'Malaysia', 'United Kingdom', 'Ireland', 'South Africa',
  'Zimbabwe', 'Nigeria', 'Kenya', 'Brazil', 'Colombia', 'Mexico', 'Fiji',
  'United States', 'Canada', 'United Arab Emirates', 'Saudi Arabia', 'Qatar',
  'Singapore', 'Hong Kong', 'South Korea', 'Japan', 'Thailand', 'Myanmar',
  'Bhutan', 'Egypt', 'Ghana', 'Other',
];

export const AU_STATES = [
  'New South Wales',
  'Victoria',
  'Queensland',
  'Western Australia',
  'South Australia',
  'Tasmania',
  'Australian Capital Territory',
  'Northern Territory',
];

export const UNIVERSAL_DOCS = [
  'Passport (certified colour copy, bio-data page)',
  'National ID card or citizenship certificate',
  'Full birth certificate',
  'Recent passport-size colour photograph',
  'Proof of name change (marriage certificate or deed poll, if applicable)',
  'Detailed resume / curriculum vitae',
  'English language test report (IELTS / PTE / OET / TOEFL)',
  'Proof of current residential address',
  'Income tax returns / notices of assessment',
  'Payslips or bank statements (income proof)',
  'NAATI-certified translations (for any non-English document)',
  'Signed statutory declaration / consent form',
];

export const PR_OCCUPATIONS = [
  {
    sector: 'Healthcare',
    list: [
      {
        name: 'Registered nurse (aged care) / (critical care)',
        anzsco: '254412 / 254415',
        body: 'ANMAC',
        type: 'Health registration and clinical hours',
        docs: [
          'Current and past nursing registration certificates or licences',
          'Verification of registration / certificate of good standing',
          'Academic transcript and graduation certificate',
          'Evidence of theory and clinical practice hours',
          'Employer reference letter (letterhead, signed by nurse manager or HR, position, dates, clinical area, hours per week)',
        ],
        requires: 'Current, valid nursing registration or licence in the country where you trained or practised.',
        ifMissing:
          "There is no pathway that skips this. ANMAC's Full, Modified, and Modified Plus assessment routes all assume you already hold overseas nursing registration — they differ only in how much recent practice and further study they require. If you're not currently registered as a nurse in your country, that has to be resolved first; a skills assessment can't substitute for it.",
        tag: 'No shortcut available',
        warn: true,
      },
      {
        name: 'General practitioner',
        anzsco: '253111',
        body: 'Medical Board of Australia / AMC',
        type: 'Medical council license verification',
        docs: [
          'Primary medical qualification certificate and transcript',
          'AMC primary source verification confirmation',
          'Certificate of good standing from every country practised in',
          'Evidence of internship / residency completion',
          'CV detailing clinical experience',
          'Police clearance / criminal history check',
          'CPD records',
          'Professional indemnity insurance evidence',
          'AMC CAT MCQ or clinical exam results (if applicable)',
        ],
        requires: 'A recognised primary medical qualification and current registration to practise medicine in your country.',
        ifMissing:
          "The Standard Pathway (AMC CAT MCQ exam plus a clinical exam) is the default route if you don't qualify for a faster Competent Authority pathway — but it still requires you to already hold a medical degree and be a licensed doctor. There's no route into this occupation without one.",
        tag: 'No shortcut available',
        warn: true,
      },
      {
        name: 'Physiotherapist',
        anzsco: '252511',
        body: 'APC',
        type: 'Clinical practice hours and degree match',
        docs: [
          'Entry-level physiotherapy degree certificate',
          'Official statement of results / transcript',
          'Letter from university confirming course completion',
          'Evidence of practice (clinical hours log)',
          'Practice thresholds mapping template',
        ],
        requires: 'An entry-level physiotherapy qualification, ideally from an APC-accredited program.',
        ifMissing:
          "If your degree isn't from an accredited program, APC uses a longer, exam-based Standard pathway instead of the faster document-based route. It takes longer and costs more, but you still need the underlying physiotherapy degree — there's no pathway based on work experience alone.",
        tag: 'Slower pathway, not a shortcut',
        warn: true,
      },
    ],
  },
  {
    sector: 'Information technology',
    list: [
      {
        name: 'Software engineer',
        anzsco: '261313',
        body: 'ACS',
        type: 'ICT curriculum breakdown and project logs',
        docs: [
          'Academic transcript, award certificate and completion letter',
          'Employer reference letters naming exact tech stack used (e.g. Python, AWS, SQL)',
          'RPL report (if degree is not ICT-major)',
          'Project logs / statements of duties showing technologies used',
          'Employment verification (payslips or tax records)',
        ],
        requires: 'A degree with substantial ICT content, assessed against your nominated ANZSCO code.',
        ifMissing:
          "If your degree isn't ICT-major, ACS offers a Recognition of Prior Learning (RPL) pathway instead. It requires 6 years of relevant ICT work experience (8 years if you hold no tertiary qualification at all), two detailed project reports describing real work you did, and evidence of current vendor certifications. It's a legitimate pathway, but far more document-intensive than the standard qualifications route.",
        tag: 'RPL pathway may apply',
        warn: false,
      },
      {
        name: 'Developer programmer',
        anzsco: '261312',
        body: 'ACS',
        type: 'ICT curriculum breakdown and project logs',
        docs: [
          'Academic transcript, award certificate and completion letter',
          'Employer reference letters naming exact tech stack used (e.g. Python, AWS, SQL)',
          'RPL report (if degree is not ICT-major)',
          'Project logs / statements of duties showing technologies used',
          'Employment verification (payslips or tax records)',
        ],
        requires: 'A degree with substantial ICT content, assessed against your nominated ANZSCO code.',
        ifMissing:
          "If your degree isn't ICT-major, ACS offers a Recognition of Prior Learning (RPL) pathway instead. It requires 6 years of relevant ICT work experience (8 years if you hold no tertiary qualification at all), two detailed project reports describing real work you did, and evidence of current vendor certifications. It's a legitimate pathway, but far more document-intensive than the standard qualifications route.",
        tag: 'RPL pathway may apply',
        warn: false,
      },
      {
        name: 'Cyber security specialist',
        anzsco: '262112',
        body: 'ACS',
        type: 'ICT curriculum breakdown and project logs',
        docs: [
          'Academic transcript, award certificate and completion letter',
          'Employer reference letters naming exact tech stack used (e.g. Python, AWS, SQL)',
          'RPL report (if degree is not ICT-major)',
          'Project logs / statements of duties showing technologies used',
          'Employment verification (payslips or tax records)',
        ],
        requires: 'A degree with substantial ICT content, assessed against your nominated ANZSCO code.',
        ifMissing:
          "If your degree isn't ICT-major, ACS offers a Recognition of Prior Learning (RPL) pathway instead. It requires 6 years of relevant ICT work experience (8 years if you hold no tertiary qualification at all), two detailed project reports describing real work you did, and evidence of current vendor certifications. It's a legitimate pathway, but far more document-intensive than the standard qualifications route.",
        tag: 'RPL pathway may apply',
        warn: false,
      },
    ],
  },
  {
    sector: 'Civil and construction',
    list: [
      {
        name: 'Civil engineer',
        anzsco: '233211',
        body: 'Engineers Australia',
        type: 'CDR report (3 career episodes)',
        docs: [
          'Competency Demonstration Report: 3 career episodes',
          'CDR summary statement',
          'CPD statement',
          'Academic transcript, degree certificate and course syllabus',
          'Career episode evidence (completion certificates, drawings, schedules, performance reviews, project photos)',
          'Professional membership confirmation',
        ],
        requires: 'An engineering degree, ideally from a Washington Accord–accredited institution.',
        ifMissing:
          "If your degree isn't from an accredited institution, the CDR (Competency Demonstration Report) pathway is actually the standard route for most applicants in this position — it's not really an alternate pathway, it's what most non-accredited-degree applicants use by default. What trips people up isn't the pathway, it's not having organised project records (technical drawings, project schedules, performance reviews) to write the three career episodes from. That evidence has to reflect real projects you actually worked on.",
        tag: 'CDR is the standard route here',
        warn: false,
      },
      {
        name: 'Construction project manager',
        anzsco: '133111',
        body: 'VETASSESS',
        type: 'Management org chart and project budgets',
        docs: [
          'Academic certificate and transcript',
          'Detailed CV',
          'Statement of service / employer reference letters',
          'Payslips',
          'Company organisational chart (your position, reporting line, team size)',
          'Project budgets and scope documents',
          'Business registration, tax returns and client invoices (if self-employed)',
        ],
        requires:
          'A Bachelor degree or higher in a field highly relevant to construction (construction methodology, cost management/building economics, construction or site management, project planning), plus at least 1 year of post-qualification relevant employment in the last 5 years.',
        ifMissing:
          'There is no employment-only pathway for this occupation — VETASSESS requires the qualification and the employment together, and years of experience cannot substitute for a missing or unrelated degree. If your degree is in an unrelated field (a general business degree, or a project management degree without built-environment content), that\'s the actual gap, and it needs to be raised directly with VETASSESS or a registered agent before assuming any workaround applies.',
        tag: 'No employment-only shortcut',
        warn: true,
      },
      {
        name: 'Quantity surveyor',
        anzsco: '233213',
        body: 'AIQS',
        type: 'Cost estimation and bill of quantities logs',
        docs: [
          'Academic transcript (via My eQuals for AU/NZ institutions)',
          'Degree certificate / testamur',
          'Course outline or unit descriptors (if requested)',
          "Employment reference letters naming referee's QS qualifications",
          "Supervisor's qualification copies",
          'Cost estimation and bill of quantities logs',
          'Certified passport photo (taken within 4 weeks)',
        ],
        requires:
          "A quantity surveying degree recognised by AIQS. Work experience is only assessed once a qualifying degree is confirmed — there's no standalone experience-only pathway.",
        ifMissing:
          "AIQS does allow a few routes short of a fully accredited overseas QS degree: a non-accredited Australian qualification plus at least 2 years of full-time post-qualification QS experience, an overseas Bachelor's or postgraduate degree specifically in quantity surveying or construction economics, or (if you already hold AIQS Corporate Membership) at least 12 months of full-time QS employment since gaining that membership. None of these skip the underlying qualification requirement — they just widen what counts as qualifying.",
        tag: 'Degree-linked alternate pathways',
        warn: true,
      },
    ],
  },
  {
    sector: 'Blue-collar trades',
    list: [
      {
        name: 'Electrician (general)',
        anzsco: '341111',
        body: 'TRA',
        type: 'Technical interview and practical evidence',
        docs: [
          'Trade qualification certificate and academic record',
          'Employer reference letters (letterhead, job description, dates, title, duties, hours, salary)',
          'Payslips, tax records or bank statements',
          'Photographic evidence of work performed',
          'Technical interview preparation evidence',
          'Practical assessment evidence',
          'Trade licence documents',
        ],
        requires: 'A formal trade qualification (or equivalent), plus relevant work experience.',
        ifMissing:
          'TRA can consider Recognition of Prior Learning if you have at least 3 years of full-time relevant trade experience, including informal, on-the-job training in place of a certificate. Because this is a licensed trade, a compulsory practical skills demonstration is required regardless of which route you take — it isn\'t a paperwork-only assessment.',
        tag: 'RPL pathway may apply',
        warn: false,
      },
      {
        name: 'Chef',
        anzsco: '351311',
        body: 'TRA',
        type: 'Recipe menus, kitchen photos and logbooks',
        docs: [
          'Trade qualification certificate and academic record',
          'Employer reference letters',
          'Payslips or tax records',
          'Recipe menus',
          'Kitchen photographs',
          'Kitchen work logbooks',
          'Video / photo evidence working in kitchen wearing PPE',
          'Tool and equipment invoices',
        ],
        requires: 'A formal trade qualification (or equivalent), plus relevant work experience.',
        ifMissing:
          'TRA can consider Recognition of Prior Learning if you have at least 3 years of full-time relevant trade experience, including informal, on-the-job training in place of a certificate. Expect a technical assessment of your skills and knowledge by a qualified tradesperson assessor, not just a document review.',
        tag: 'RPL pathway may apply',
        warn: false,
      },
      {
        name: 'Motor mechanic (general)',
        anzsco: '321211',
        body: 'TRA',
        type: 'Workshop tool inventory and repair logs',
        docs: [
          'Trade qualification certificate and academic record',
          'Employer reference letters',
          'Payslips or tax records',
          'Workshop tool inventory',
          'Repair logs',
          'Video / photo evidence working in workshop wearing PPE',
          'Tool and equipment invoices',
        ],
        requires: 'A formal trade qualification (or equivalent), plus relevant work experience.',
        ifMissing:
          'TRA can consider Recognition of Prior Learning if you have at least 3 years of full-time relevant trade experience, including informal, on-the-job training in place of a certificate. Expect a technical assessment of your skills and knowledge by a qualified tradesperson assessor, not just a document review.',
        tag: 'RPL pathway may apply',
        warn: false,
      },
    ],
  },
];

export const findOccupation = (value) => {
  if (!value) return null;
  const [gi, oi] = value.split('-').map(Number);
  return PR_OCCUPATIONS[gi]?.list?.[oi] || null;
};

export const getOccupationOptions = () => {
  const options = [{ value: '', label: 'Select an occupation or trade' }];
  PR_OCCUPATIONS.forEach((group, gi) => {
    group.list.forEach((occ, oi) => {
      options.push({
        value: `${gi}-${oi}`,
        label: `${occ.name} (${occ.anzsco})`,
        group: group.sector,
      });
    });
  });
  return options;
};
