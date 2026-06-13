import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import * as Icons from 'lucide-react';
const { 
  ShieldCheck, Check, AlertTriangle, AlertCircle, FileCheck, 
  ExternalLink, User, Phone, Mail, Award, MapPin, GraduationCap, 
  CheckCircle, Briefcase, HelpCircle, Upload, ArrowRight, ShieldAlert,
  Landmark, FileText, Globe, Megaphone
} = Icons;

const PRICE_PER_SERVICE = 250;

const JOBS_BY_INDUSTRY = {
  "Skilled Trades — Welding": ["Welding — Engineering", "Welding — Entry Level", "Welding — Pipe Welding", "Welding — Plate & Structural", "Welding — Specialist", "Welding — Supervision"],
  "Skilled Trades — Electrical": ["Electrical — Commercial", "Electrical — Engineering", "Electrical — Entry Level", "Electrical — High Voltage", "Electrical — Industrial", "Electrical — Instrumentation", "Electrical — Offshore & Marine", "Electrical — Residential", "Electrical — Supervision"],
  "Skilled Trades — HVAC": ["HVAC — Commercial", "HVAC — Engineering", "HVAC — Entry Level", "HVAC — Industrial", "HVAC — Offshore", "HVAC — Residential", "HVAC — Specialist", "HVAC — Supervision"],
  "Skilled Trades — Fitting": ["Fitting & Pipefitting — Engineering", "Fitting & Pipefitting — Entry Level", "Fitting & Pipefitting — General", "Fitting & Pipefitting — Pipefitting", "Fitting & Pipefitting — Specialist", "Fitting & Pipefitting — Structural", "Fitting & Pipefitting — Supervision"],
  "Skilled Trades — Plumbing": ["Plumbing — Commercial", "Plumbing — Engineering", "Plumbing — Entry Level", "Plumbing — Industrial", "Plumbing — Residential", "Plumbing — Specialist", "Plumbing — Supervision"],
  "Skilled Trades — Painting": ["Decorative Painting — Commercial", "Decorative Painting — Residential", "Decorative Painting — Specialist", "Industrial Painting — Entry Level", "Industrial Painting — Industrial", "Industrial Painting — Marine", "Industrial Painting — Specialist", "Industrial Painting — Supervision"],
  "Skilled Trades — Construction": ["Carpentry — Entry Level", "Carpentry — Trade", "Heavy Equipment — No Qual Entry", "Heavy Equipment — Trade", "Masonry & Concrete — Entry Level", "Masonry & Concrete — Trade", "Scaffolding — Entry Level", "Scaffolding — Supervision", "Scaffolder — Trade"],
  "Housekeeping & Facilities": ["Facilities — Entry Level", "Facilities — Management", "Facilities — Specialist", "Facilities — Supervisor", "Housekeeping — Entry Level", "Housekeeping — Management", "Housekeeping — Specialist", "Housekeeping — Supervisor", "Marine Housekeeping — Entry Level", "Marine Housekeeping — Supervisor"],
  "Food Service & Catering": ["Catering — Industrial / Offshore", "Kitchen — Career Growth", "Kitchen — Entry Level", "Kitchen — Senior", "Service — Career Growth", "Service — Entry Level", "Service — Management"],
  "Security Services": ["Security — Career Growth", "Security — Entry Level", "Security — Management", "Security — Specialist", "Security — Supervisor"],
  "Healthcare Support": ["Ambulance — 10th + Training", "Ambulance — EMT + Experience", "Patient Care — Career Growth", "Patient Care — Entry Level", "Support Services — Entry Level", "Support Services — No Qual", "Technical Support — 10th + Training", "Technical Support — Diploma"],
  "Transport & Driving": ["Driving — Career Growth", "Driving — Entry Level", "Driving — Management", "Driving — Specialist", "Driving — Supervision"],
  "Retail & General Trade": ["Automotive Service — Cert", "Automotive Service — Diploma", "Automotive Service — ITI", "Automotive Service — No Qual", "Retail — Career Growth", "Retail — Entry Level", "Retail — Management", "Warehouse — Career Growth", "Warehouse — Entry Level", "Warehouse — Supervision"],
  "Aircraft Manufacturing": ["Access Control Officer", "Accountant", "Accounts Assistant", "Aeronautical Engineer", "Aircraft Fitter", "Assembler", "Avionics Engineer", "Avionics Technician", "Business Development Manager", "CAD Engineer", "CCTV Operator", "CNC Operator", "Chief Executive Officer", "Chief Financial Officer", "Chief Operating Officer", "Cleaner", "Commercial Director", "Composite Technician", "Contracts Manager", "Design Engineer", "Electrical Engineer", "Electrical Maintenance Technician", "Electrical Supervisor", "Electrician", "Engineering Manager", "Environmental Officer", "Fabrication Supervisor", "Fabricator", "Facility Assistant", "Facility Manager", "Facility Supervisor", "Finance Analyst", "Finance Manager", "HR Assistant", "HR Executive", "HR Manager", "HSE Engineer", "Housekeeping Attendant", "IT Manager", "IT Support", "Inventory Controller", "Janitor", "Lead Engineer", "Logistics Coordinator", "Machine Operator", "Maintenance Manager", "Maintenance Supervisor", "Maintenance Technician", "Mechanical Maintenance Technician", "Mechanical Technician", "NDT Technician", "Operations Director", "Pest Control Technician", "Plant Manager", "Procurement Officer", "Production Helper", "Production Manager", "Production Supervisor", "Program Manager", "Project Coordinator", "Project Director", "Project Engineer", "QA Technician", "QA/QC Manager", "Quality Engineer", "Quality Inspector", "R&D Engineer", "Riveter", "Safety Manager", "Safety Officer", "Sales Executive", "Security Guard", "Security Manager", "Security Supervisor", "Sheet Metal Worker", "Software Engineer", "Storekeeper", "Stress Engineer", "Structural Fitter", "Supply Chain Manager", "System Administrator", "TIG/MIG Welder", "Talent Acquisition Manager", "Tool Design Engineer", "Tooling Manager", "Tooling Technician", "Vice President (Manufacturing)", "Warehouse Assistant", "Waste Management Staff", "Welder", "Wiring Technician"],
  "Aviation": ["AME (Aircraft Maintenance Engineer)", "ATC Assistant", "ATC Supervisor", "Accountant", "Accounts Assistant", "Air Traffic Controller", "Aircraft Technician", "Aviation Auditor", "Avionics Technician", "Baggage Handler", "Boarding Gate Agent", "Cabin Crew Trainee", "Cabin Services Manager", "Cadet Pilot", "Captain", "Cargo Agent", "Cargo Handler", "Cargo Manager", "Cargo Supervisor", "Check-in Agent", "Chief Executive Officer", "Chief Financial Officer", "Chief Operating Officer", "Chief Pilot", "Compliance Officer", "Customer Service Executive", "Director", "Duty Officer", "Finance Analyst", "Finance Manager", "First Officer", "Flight Attendant", "General Manager", "Ground Operations Supervisor", "HR Assistant", "HR Executive", "HR Manager", "IT Manager", "IT Support", "Lead Cabin Crew", "Licensed Aircraft Engineer", "Load Controller", "Maintenance Manager", "Maintenance Planner", "Maintenance Supervisor", "Marshaller", "Operations Manager", "Passenger Service Agent", "Purser", "Quality Inspector", "Ramp Agent", "Reservation Agent", "Revenue Manager", "Safety Manager", "Safety Officer", "Sales Manager", "Screening Officer", "Security Manager", "Security Officer", "Security Supervisor", "Senior ATC Officer", "Senior Cabin Crew", "Senior First Officer", "Software Engineer", "Station Manager", "System Administrator", "Talent Acquisition Specialist", "Ticketing Agent", "Training Captain"],
  "Marine / Cruise Ship": ["Able Seaman", "Accountant", "Accounts Assistant", "Barge Supervisor", "Bosun", "Cabin Steward", "Chief Cook", "Chief Engineer", "Chief Executive Officer", "Chief Financial Officer", "Chief Officer", "Chief Operating Officer", "Chief Steward/Stewardess", "Cook", "Crane Operator", "Crew Coordinator", "Crew Manager", "Crewing Officer", "DPO (Dynamic Positioning Officer)", "Deck Cadet", "Director", "Engine Cadet", "Finance Manager", "Fourth Engineer", "General Manager", "HR Manager", "Housekeeping Attendant", "Housekeeping Supervisor", "IT Manager", "IT Support", "Laundry Operator", "Master (Captain)", "Messman", "Oiler", "Operations Manager", "Procurement Officer", "ROV Pilot", "Rigger", "Second Engineer", "Second Officer", "Software Developer", "Storekeeper", "Supply Chain Manager", "System Administrator", "Third Engineer", "Third Officer", "Warehouse Supervisor", "Wiper"],
  "Marine / Shipping": ["Able Seaman (AB)", "Bosun (Boatswain)", "Cabin Steward (Ship)", "Captain / Master", "Cargo Officer", "Chief Cook (Ship)", "Chief Engineer", "Chief Officer / Chief Mate", "Chief Steward (Ship)", "Deck Cadet", "Deck Fitter", "Electro-Technical Officer (ETO)", "Engine Cadet", "Fourth Engineer", "Junior Engineer (Ship)", "Laundry Attendant (Ship)", "Mess Boy / Galley Helper", "Motorman (Ship)", "Oiler", "Ordinary Seaman (OS)", "Pumpman", "Quartermaster", "Safety Officer (Ship)", "Saloon Steward", "Second Cook (Ship)", "Second Engineer", "Second Officer / Second Mate", "Ship Electrician", "Ship Fitter", "Third Engineer", "Third Officer / Third Mate", "Wiper"],
  "Shipyard / Docking Yard": ["Arc Welder (Shipyard)", "Bilge Pump Operator", "CAD Operator (Shipyard)", "Cable Installer", "Coating Inspector", "Dimensional Controller", "Dock Master", "Docking Engineer", "Draftsman (Shipyard)", "Drydock Operator", "Drydock Supervisor", "Electrical Supervisor (Shipyard)", "Electronics Technician (Shipyard)", "Fire Watch", "Hull Supervisor", "MIG Welder (Shipyard)", "Marine Engineer (Shipyard)", "Marine Painter", "Marine Surveyor", "Material Handler (Shipyard)", "NDT Technician", "Naval Architect", "Painter-Blaster", "Pipe Fitter (Shipyard)", "Piping Engineer", "Piping Supervisor", "Plasma Cutting Operator", "Plate Worker", "Project Manager (Shipyard)", "QC Inspector (Shipyard)", "Rigging Supervisor", "Safety Officer (Shipyard)", "Sand Blaster", "Ship Designer", "Ship Fitter (Shipyard)", "Shipyard Carpenter", "Shipyard Electrician", "Shipyard Foreman", "Shipyard Plumber", "Shipyard Welder", "Slipway Operator", "Solderer", "Steel Cutter", "Store Keeper (Shipyard)", "Structural Fabricator", "Structural Fitter", "TIG Welder (Shipyard)", "Template Maker", "Weld Inspector", "Yard Helper / Labourer"],
  "Rigging & Lifting": ["Advanced Scaffolder", "Certified Rigger", "Crawler Crane Operator", "Floating Crane Operator", "Forklift Operator", "Gantry Crane Operator", "Hoist Operator", "Lift Supervisor", "Lifting Equipment Inspector", "Master Rigger", "Mobile Crane Operator", "Overhead Crane Operator", "Rigger", "Rigger Helper", "Scaffold Inspector", "Scaffold Supervisor", "Scaffolder", "Scaffolder Helper", "Senior Rigger", "Signal Man / Banksman", "Sling Man", "Tower Crane Operator", "Winch Operator"],
  "Offshore Oil & Gas": ["Assistant Driller", "Ballast Control Operator", "Camp Boss", "Commercial Diver", "Company Man / Well Site Leader", "Control Room Operator", "Corrosion Engineer", "Crane Operator (Offshore)", "DP Operator", "Deck Foreman", "Derrickhand", "Dive Supervisor", "Driller", "Engine Room Operator", "Floorhand", "HSE Manager (Offshore)", "Instrumentation Technician", "Marine Officer (OSV)", "Medic (Offshore)", "Motorman (Offshore)", "Mud Engineer", "Mud Logger", "NDT Inspector (Offshore)", "Offshore Cook", "Offshore Electrician", "Offshore Installation Manager (OIM)", "Offshore Mechanic", "Offshore Pipefitter", "Offshore Rigger", "Offshore Scaffolder", "Offshore Welder", "Process Operator", "Production Operator", "Production Technician", "QA/QC Inspector (Offshore)", "ROV Pilot / Technician", "ROV Supervisor", "Radio Operator (Offshore)", "Rig Manager", "Roughneck", "Roustabout", "Safety Officer (Offshore)", "Saturation Diver", "Steward (Offshore)", "Subsea Engineer", "Subsea Technician", "Supply Vessel Coordinator", "Toolpusher", "Turbine Technician", "Underwater Welder / Diver", "Well Test Operator"]
};

const INDUSTRY_LIST = Object.keys(JOBS_BY_INDUSTRY).sort();

import CustomSelect from './CustomSelect';

const EDUCATION_OPTIONS = [
  { value: "Below 10th", label: "Below 10th" },
  { value: "10th Pass", label: "10th Pass" },
  { value: "12th Pass", label: "12th Pass" },
  { value: "ITI / Diploma", label: "ITI / Diploma" },
  { value: "Graduate (BA/BSc/BCom)", label: "Graduate (BA/BSc/BCom)" },
  { value: "Engineering Degree", label: "Engineering Degree" },
  { value: "Post Graduate", label: "Post Graduate" },
  { value: "Other", label: "Other" }
];

const STATUS_OPTIONS = [
  { value: "Student", label: "Student" },
  { value: "Unemployed - Looking for work", label: "Unemployed - Looking for work" },
  { value: "Working - Want to switch", label: "Working - Want to switch" },
  { value: "Working - Want overseas job", label: "Working - Want overseas job" },
  { value: "Freelancer / Self-employed", label: "Freelancer / Self-employed" },
  { value: "Other", label: "Other" }
];

const COUNTRY_OPTIONS = [
  { value: "UAE / Dubai", label: "UAE / Dubai" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Qatar", label: "Qatar" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Oman", label: "Oman" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Australia", label: "Australia" },
  { value: "Canada", label: "Canada" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Germany", label: "Germany" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Singapore", label: "Singapore" },
  { value: "Norway", label: "Norway" },
  { value: "USA", label: "USA" },
  { value: "Other", label: "Other" }
];

const PASSPORT_OPTIONS = [
  { value: "Yes - Valid passport", label: "Yes - Valid passport" },
  { value: "Yes - Expired passport", label: "Yes - Expired passport" },
  { value: "No - Don't have passport", label: "No - Don't have passport" },
  { value: "Applied - Waiting", label: "Applied - Waiting" }
];

const EXP_OPTIONS = [
  { value: "No - First time", label: "No - First time" },
  { value: "Yes - Less than 2 years", label: "Yes - Less than 2 years" },
  { value: "Yes - 2 to 5 years", label: "Yes - 2 to 5 years" },
  { value: "Yes - More than 5 years", label: "Yes - More than 5 years" }
];

const INDUSTRY_DROPDOWN_OPTIONS = INDUSTRY_LIST.map(ind => ({ value: ind, label: ind }));

const LandingPage = ({ onAdminClick }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    age: '',
    address: '',
    education: '',
    currentStatus: '',
    skills: '',
    notes: '',
    careerIndustry: '',
    careerJobTitle: '',
    preferredCountry: '',
    passport: '',
    overseasExp: '',
    placementIndustry: ''
  });

  const [servicesList, setServicesList] = useState([]);
  const [visaPathwaysList, setVisaPathwaysList] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});

  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('none'); // 'none', 'checkout', 'success'

  useEffect(() => {
    // Fetch Services
    const fetchServices = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/services');
        if (res.ok) {
          const data = await res.json();
          setServicesList(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Fetch Visa Pathways
    const fetchPathways = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/visa-pathways');
        if (res.ok) {
          const data = await res.json();
          setVisaPathwaysList(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchServices();
    fetchPathways();

    const socket = io('http://localhost:5000');

    socket.on('service_created', (newService) => {
      setServicesList(prev => {
        if (prev.some(s => s._id === newService._id)) return prev;
        return [...prev, newService];
      });
    });

    socket.on('service_updated', (updatedService) => {
      setServicesList(prev => prev.map(s => s._id === updatedService._id ? updatedService : s));
    });

    socket.on('service_deleted', (deletedId) => {
      setServicesList(prev => {
        const target = prev.find(s => s._id === deletedId);
        if (target) {
          setSelectedServices(sel => {
            const nextSel = { ...sel };
            delete nextSel[target.key];
            return nextSel;
          });
        }
        return prev.filter(s => s._id !== deletedId);
      });
    });

    socket.on('visa_pathway_created', (newPathway) => {
      setVisaPathwaysList(prev => {
        if (prev.some(p => p._id === newPathway._id)) return prev;
        return [...prev, newPathway];
      });
    });

    socket.on('visa_pathway_updated', (updatedPathway) => {
      setVisaPathwaysList(prev => prev.map(p => p._id === updatedPathway._id ? updatedPathway : p));
    });

    socket.on('visa_pathway_deleted', (deletedId) => {
      setVisaPathwaysList(prev => prev.filter(p => p._id !== deletedId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleServiceChange = (serviceKey) => {
    setSelectedServices(prev => ({ ...prev, [serviceKey]: !prev[serviceKey] }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    }
  };

  // Calculate pricing based on checked services
  const selectedCount = Object.values(selectedServices).filter(Boolean).length;
  const totalAmount = servicesList.reduce((sum, service) => {
    if (selectedServices[service.key]) {
      return sum + service.price;
    }
    return sum;
  }, 0);

  // Validate Booking Form before simulated checkout
  const validateForm = () => {
    const required = ['fullName', 'phone', 'email', 'age', 'address', 'education', 'currentStatus'];
    for (const key of required) {
      if (!formData[key]?.trim()) {
        alert(`Please fill in the required field: ${key}`);
        return false;
      }
    }
    if (selectedCount === 0) {
      alert('Please select at least one advisory service.');
      return false;
    }
    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiateBooking = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert('Failed to load Razorpay. Please check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on backend
      const orderResponse = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to initialize payment gateway.');
      }

      const orderData = await orderResponse.json();

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id', 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RouteUp',
        description: 'Career & Visa Advisory',
        image: '/Routeup Logo.png',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            setLoading(true);
            // 3. Prepare data and verify on backend
            const submissionData = new FormData();
            submissionData.append('name', formData.fullName);
            submissionData.append('phone', formData.phone);
            submissionData.append('email', formData.email);
            submissionData.append('age', formData.age);
            submissionData.append('address', formData.address);
            submissionData.append('education', formData.education);
            submissionData.append('currentStatus', formData.currentStatus);
            submissionData.append('skills', formData.skills);
            submissionData.append('notes', formData.notes);
            submissionData.append('amount', totalAmount);

            // Append services array
            const serviceArray = Object.keys(selectedServices).filter(k => selectedServices[k]);
            submissionData.append('services', serviceArray.join(','));

            // Append conditional fields
            if (selectedServices.career) {
              submissionData.append('careerIndustry', formData.careerIndustry);
              submissionData.append('careerJobTitle', formData.careerJobTitle);
            }
            if (selectedServices.visa) {
              submissionData.append('preferredCountry', formData.preferredCountry);
              submissionData.append('passport', formData.passport);
              submissionData.append('overseasExp', formData.overseasExp);
            }
            if (selectedServices.placement) {
              submissionData.append('placementIndustry', formData.placementIndustry);
              if (cvFile) {
                submissionData.append('cv', cvFile);
              }
            }

            // Append Razorpay verification data
            submissionData.append('razorpay_payment_id', response.razorpay_payment_id);
            submissionData.append('razorpay_order_id', response.razorpay_order_id);
            submissionData.append('razorpay_signature', response.razorpay_signature);

            const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
              method: 'POST',
              body: submissionData
            });

            if (!bookingResponse.ok) {
              const err = await bookingResponse.json();
              throw new Error(err.message || 'Payment verified but booking failed to save.');
            }

            setPaymentStep('success');
          } catch (error) {
            console.error(error);
            alert(`Error finalizing booking: ${error.message}`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#1d4ed8'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form and close modal
  const handleCloseModal = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      age: '',
      address: '',
      education: '',
      currentStatus: '',
      skills: '',
      notes: '',
      careerIndustry: '',
      careerJobTitle: '',
      preferredCountry: '',
      passport: '',
      overseasExp: '',
      placementIndustry: ''
    });
    setSelectedServices({});
    setCvFile(null);
    setPaymentStep('none');
  };

  const scrollToForm = () => {
    document.getElementById('book').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <nav className="navbar">
        <div className="logo-container" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/Routeup Logo.png" alt="RouteUp Logo" style={{ height: '44px', objectFit: 'contain' }} />
        </div>
        <div className="nav-links">
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#education">Visa Guide</a>
          <a href="#awareness">Scam Alerts</a>
          <button className="nav-cta" onClick={scrollToForm}>Book Session</button>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-badge">
          <ShieldCheck size={16} /> Trusted Career Advisory for 10th/12th Pass Students
        </div>
        <h1>Your Career <span className="highlight">Starts Here.</span><br />No Degree Needed.</h1>
        <p>Expert guidance on skilled trades, overseas jobs, visa & migration pathways. From ITI to international careers - we show you the route up.</p>
        
        <button onClick={scrollToForm} className="hero-cta">
          Book Your Session - Rs.250 <ArrowRight size={18} />
        </button>

        <div className="hero-stats">
          <div className="stat"><h3>460+</h3><p>Career Paths Mapped</p></div>
          <div className="stat"><h3>20+</h3><p>Industries Covered</p></div>
          <div className="stat"><h3>15+</h3><p>Countries for Migration</p></div>
        </div>
      </header>

      {/* ABOUT US */}
      <section className="section-padding about-section" id="about">
        <div className="about-container">
          <div className="about-top">
            <div className="about-text">
              <div className="section-subtitle">Who We Are</div>
              <h2>RouteUp Career Hub</h2>
              <p>RouteUp is a career advisory platform built specifically for skilled trade workers, ITI/diploma holders, and 10th/12th pass candidates who deserve real career guidance — not empty promises from unlicensed agents.</p>
              <p>We've mapped over 460 career paths across 20+ industries, from welding and electrical trades to aviation, marine, offshore oil & gas, and shipyard operations. Whether you're looking to grow locally or migrate overseas, we help you see the full picture before you take the next step.</p>
              <div className="highlight-text">
                Every session is a 1-on-1 conversation with a career expert who understands blue-collar and trade career pathways — not a generic chatbot or a call-center script.
              </div>
            </div>

            <div className="why-box">
              <h3>Why We Do This</h3>
              <p>Every year, thousands of young Indians are cheated by fake agents promising overseas jobs. They pay lakhs, get nothing, and lose years of their life to scams.</p>
              <p>We started RouteUp because we believe that honest, affordable career advice should be accessible to every worker — not just those who can afford expensive consultants or have connections.</p>
              <p>For just Rs.250, you get a 45-minute session that can change the direction of your career. No hidden fees. No false promises. Just clear guidance on what's realistic, what's required, and how to get there safely.</p>
              
              <div className="why-values">
                <div className="why-value"><Check size={16} /> No Fake Promises</div>
                <div className="why-value"><Check size={16} /> Verified Pathways</div>
                <div className="why-value"><Check size={16} /> Affordable Entry</div>
                <div className="why-value"><Check size={16} /> Anti-Scam Policy</div>
              </div>
            </div>
          </div>

          {/* INDUSTRIES & COUNTRIES SPECS */}
          <div className="spec-section">
            <div className="spec-block">
              <h3>Specialized <span>Industries</span></h3>
              <div className="spec-tags">
                <span className="spec-tag"><Briefcase size={14} /> Welding</span>
                <span className="spec-tag"><Briefcase size={14} /> Electrical</span>
                <span className="spec-tag"><Briefcase size={14} /> HVAC</span>
                <span className="spec-tag"><Briefcase size={14} /> Fitting & Pipefitting</span>
                <span className="spec-tag"><Briefcase size={14} /> Plumbing</span>
                <span className="spec-tag"><Briefcase size={14} /> Painting</span>
                <span className="spec-tag"><Briefcase size={14} /> Construction</span>
                <span className="spec-tag"><Briefcase size={14} /> Aviation</span>
                <span className="spec-tag"><Briefcase size={14} /> Shipyard Operations</span>
                <span className="spec-tag"><Briefcase size={14} /> Rigging & Lifting</span>
                <span className="spec-tag"><Briefcase size={14} /> Offshore Oil & Gas</span>
                <span className="spec-tag"><Briefcase size={14} /> Transport & Logistics</span>
              </div>
            </div>

            <div className="spec-block">
              <h3>Countries <span>We Guide For</span></h3>
              <div className="spec-tags">
                <span className="spec-tag">🇦🇪 UAE / Dubai</span>
                <span className="spec-tag">🇸🇦 Saudi Arabia</span>
                <span className="spec-tag">🇶🇦 Qatar</span>
                <span className="spec-tag">🇰🇼 Kuwait</span>
                <span className="spec-tag">🇴🇲 Oman</span>
                <span className="spec-tag">🇧🇭 Bahrain</span>
                <span className="spec-tag">🇦🇺 Australia</span>
                <span className="spec-tag">🇨🇦 Canada</span>
                <span className="spec-tag">🇬🇧 United Kingdom</span>
                <span className="spec-tag">🇩🇪 Germany</span>
                <span className="spec-tag">🇳🇿 New Zealand</span>
                <span className="spec-tag">🇸🇬 Singapore</span>
                <span className="spec-tag">🇳🇴 Norway</span>
                <span className="spec-tag">🇺🇸 USA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-padding services-section" id="services">
        <div className="section-title-wrapper">
          <div className="section-subtitle">Advisory Services</div>
          <h2 className="section-title">Our Services</h2>
          <p className="section-desc">Choose the guidance you need. One session can change your career trajectory.</p>
        </div>

        <div className="services-grid">
          {servicesList.map(service => (
            <div className="service-card" key={service._id}>
              <div className="service-icon-wrapper">
                {Icons[service.icon] ? React.createElement(Icons[service.icon], { size: 32 }) : <span>{service.icon}</span>}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="service-price">Rs.{service.price} <span>/ 45 min session</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION & VISA GUIDANCE */}
      <section className="section-padding visa-section" id="education">
        <div className="section-title-wrapper">
          <div className="section-subtitle">Visa Pathways</div>
          <h2 className="section-title">Visa Pathways & Country Guidance</h2>
          <p className="section-desc">Every country has different visa rules, work permits, and skill requirements. We break it all down for you.</p>
        </div>

        <div className="edu-intro">
          For every country you're interested in, we provide a detailed explanation document covering visa categories, eligibility, required documents, processing time, costs, and step-by-step application guidance.
        </div>

        <div className="country-visa-grid">
          {visaPathwaysList.map(pathway => (
            <div className="visa-card" key={pathway._id}>
              <div className="visa-card-header">
                <span className="country-flag">{pathway.countryFlag}</span>
                <h3>{pathway.countryName}</h3>
              </div>
              <div className="visa-types">
                {pathway.visaTypes.map((type, idx) => (
                  <span className="visa-type-tag" key={idx}>{type}</span>
                ))}
              </div>
              <p>{pathway.description}</p>
              <div className="doc-badge"><FileCheck size={16} /> {pathway.docBadgeText}</div>
            </div>
          ))}
        </div>

        <div className="edu-bottom-note">
          <h3>📘 What You Get in Every Session</h3>
          <p>After your consultation, you'll receive a personalized document covering the exact visa pathway for your chosen country, based on your education level, trade skills, and experience.</p>
          <button onClick={scrollToForm}>Book Your Session Now</button>
        </div>
      </section>

      {/* STUDENT STUDY ABROAD FLOW */}
      <section className="section-padding student-section">
        <div className="section-title-wrapper">
          <div className="section-subtitle">Study Abroad</div>
          <h2 className="section-title">Study Abroad? Start With RouteUp</h2>
          <p className="section-desc">Before you apply to any university or pay any agent, talk to us. We guide you on courses, country rules, and work permits.</p>
        </div>

        <div className="student-flow">
          <div className="flow-card">
            <div className="flow-num">1</div>
            <div className="flow-icon-wrapper"><HelpCircle size={28} /></div>
            <h3>Understand Goals</h3>
            <p>Tell us your education, budget, preferred country, and career interest. We assess your profile.</p>
          </div>
          <div className="flow-card">
            <div className="flow-num">2</div>
            <div className="flow-icon-wrapper"><GraduationCap size={28} /></div>
            <h3>Course Match</h3>
            <p>We recommend courses and universities that align with your career goals and have strong work options.</p>
          </div>
          <div className="flow-card">
            <div className="flow-num">3</div>
            <div className="flow-icon-wrapper"><FileCheck size={28} /></div>
            <h3>Visa & Work Rights</h3>
            <p>We map out the student visa process, post-study work rights, and pathways to permanent residency.</p>
          </div>
          <div className="flow-card">
            <div className="flow-num">4</div>
            <div className="flow-icon-wrapper"><CheckCircle size={28} /></div>
            <h3>Guidance Doc</h3>
            <p>You receive a personalized document covering course options, costs, timelines, and post-study opportunities.</p>
          </div>
        </div>

        <div className="student-benefits">
          <div className="benefit-card">
            <div className="ben-icon-wrapper">CA</div>
            <div>
              <h4>Canada — Post-Graduation Work Permit (PGWP)</h4>
              <p>Study in a DLI-designated college and get up to 3 years of open work permit after graduation. Pathway to Express Entry PR.</p>
            </div>
          </div>
          <div className="benefit-card">
            <div className="ben-icon-wrapper">AU</div>
            <div>
              <h4>Australia — Post-Study Work Visa (Subclass 485)</h4>
              <p>2-4 years of work rights after graduation depending on qualification. Trades and nursing on priority skilled lists for permanent residency.</p>
            </div>
          </div>
          <div className="benefit-card">
            <div className="ben-icon-wrapper">GB</div>
            <div>
              <h4>UK — Graduate Route Visa</h4>
              <p>2-year post-study work visa (3 years for PhD). No sponsorship needed. Can switch to Skilled Worker Visa if you find a sponsor employer.</p>
            </div>
          </div>
          <div className="benefit-card">
            <div className="ben-icon-wrapper">DE</div>
            <div>
              <h4>Germany — 18-Month Job Seeker Visa After Study</h4>
              <p>Free or very low tuition at public universities. 18 months to find a job after graduation. Strong demand for technical and trade qualifications.</p>
            </div>
          </div>
          <div className="benefit-card">
            <div className="ben-icon-wrapper">NZ</div>
            <div>
              <h4>New Zealand — Post-Study Work Visa</h4>
              <p>1-3 years of open work rights after study. Trade qualifications (plumbing, electrical) are on the Green List for fast-track residency.</p>
            </div>
          </div>
          <div className="benefit-card">
            <div className="ben-icon-wrapper">SG</div>
            <div>
              <h4>Singapore — Training Employment Pass</h4>
              <p>Polytechnic and ITE courses lead to work permits. Employers sponsor S Pass or Work Permit for skilled trade graduates.</p>
            </div>
          </div>
        </div>

        <div className="student-cta">
          <h3>💡 Don't Pick a University Before You Know the Work Visa Rules</h3>
          <p>Many students spend lakhs on courses overseas only to discover they can't work after graduation. RouteUp helps you choose a course where you can study, work, and potentially settle.</p>
          <button onClick={scrollToForm}>Get Study Abroad Guidance — Rs.250</button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-padding how-it-works">
        <div className="section-title-wrapper">
          <div className="section-subtitle">Timeline</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-desc">Simple 4-step process to get started</p>
        </div>

        <div className="steps-container">
          <div className="step-item">
            <div className="step-num-badge">1</div>
            <h3>Fill the Form</h3>
            <p>Share your education, interests & what guidance you need</p>
          </div>
          <div className="step-item">
            <div className="step-num-badge">2</div>
            <h3>Make Payment</h3>
            <p>Secure payment of Rs.250 via Razorpay (simulated for testing)</p>
          </div>
          <div className="step-item">
            <div className="step-num-badge">3</div>
            <h3>Get Scheduled</h3>
            <p>We'll call you within 24 hours to confirm your session time</p>
          </div>
          <div className="step-item">
            <div className="step-num-badge">4</div>
            <h3>Attend Session</h3>
            <p>45-minute 1-on-1 session with our career expert</p>
          </div>
        </div>
      </section>

      {/* SCAM AWARENESS */}
      <section className="section-padding awareness-section" id="awareness">
        <div className="section-title-wrapper">
          <div className="section-subtitle text-danger">Safety Alert</div>
          <h2 className="section-title">Visa & Job <span className="red-highlight">Scam Alerts</span></h2>
          <p className="section-desc">Protect yourself from fake agents, fraudulent job offers, and illegal recruitment. Know the red flags before you pay anyone.</p>
        </div>

        <div className="alert-grid">
          <div className="alert-card">
            <div className="alert-card-header">
              <AlertTriangle className="alert-icon-wrapper" size={28} />
              <span className="alert-tag">MEA Advisory</span>
            </div>
            <h3>Fake Overseas Job Offers</h3>
            <p>The Ministry of External Affairs warns of a huge rise in job seekers being cheated by unregistered recruitment agents through fake job offers, charging Rs. 2-5 lakhs. These agents operate mainly through social media and WhatsApp without any valid license.</p>
          </div>

          <div className="alert-card">
            <div className="alert-card-header">
              <AlertTriangle className="alert-icon-wrapper" size={28} />
              <span className="alert-tag">US Embassy Alert</span>
            </div>
            <h3>"Guaranteed Visa" Scams</h3>
            <p>The US Embassy in India confirms: No agent can guarantee a US visa. Fraudsters circulate WhatsApp messages offering "back-door" interview dates for Rs.50,000 to Rs.3 lakh. The only legitimate booking channel is ustraveldocs.com.</p>
          </div>

          <div className="alert-card">
            <div className="alert-card-header">
              <AlertTriangle className="alert-icon-wrapper" size={28} />
              <span className="alert-tag">Govt Warning</span>
            </div>
            <h3>Fake E-Visa Websites</h3>
            <p>Multiple fake e-visa websites claim to provide visa services with "faster processing" for extra charges. The Indian Government does not appoint any agents for e-visa processing. Always apply only through official government portals.</p>
          </div>

          <div className="alert-card">
            <div className="alert-card-header">
              <AlertTriangle className="alert-icon-wrapper" size={28} />
              <span className="alert-tag">Fraud Alert</span>
            </div>
            <h3>Overcharging by Agents</h3>
            <p>Unregistered agents demand huge upfront payments for visa processing, medical tests, or "connection fees." Genuine registered agents follow government-set fee limits. Never pay large sums without verifying the agent's MEA registration certificate.</p>
          </div>

          <div className="alert-card">
            <div className="alert-card-header">
              <User className="alert-icon-wrapper" size={28} />
              <span className="alert-tag">Human Trafficking</span>
            </div>
            <h3>Illegal Recruitment Networks</h3>
            <p>Operating without an MEA license is a violation of the Emigration Act 1983 and amounts to human trafficking — a punishable criminal offense. Victims often end up stranded abroad with confiscated passports and no legal recourse.</p>
          </div>

          <div className="alert-card">
            <div className="alert-card-header">
              <AlertCircle className="alert-icon-wrapper" size={28} />
              <span className="alert-tag">2025 Data</span>
            </div>
            <h3>75x Jump in Cyber Fraud</h3>
            <p>Official MEA data shows cyber fraud and blackmail complaints by Indians abroad jumped from just 8 cases in 2024 to 613 in 2025 — a 75-fold increase. Scammers are getting more sophisticated with AI-generated documents and fake company websites.</p>
          </div>
        </div>

        <div className="safety-checklist">
          <h3><ShieldCheck size={24} /> How to Protect Yourself</h3>
          <div className="checklist-items">
            <div className="checklist-item"><Check size={16} /> <span>Verify agent's Registration Certificate (RC) from the Protector General of Emigrants, Govt. of India</span></div>
            <div className="checklist-item"><Check size={16} /> <span>Check the agent on the official eMigrate portal before dealing with them</span></div>
            <div className="checklist-item"><Check size={16} /> <span>Never pay large sums upfront — genuine employers cover recruitment costs</span></div>
            <div className="checklist-item"><Check size={16} /> <span>Ask to see the original Demand Letter and Power of Attorney from the foreign employer</span></div>
            <div className="checklist-item"><Check size={16} /> <span>Never hand over your original passport to any agent or employer</span></div>
            <div className="checklist-item"><Check size={16} /> <span>Report fraud to local police and MEA's 24/7 helpline: 1800-11-3090</span></div>
          </div>
        </div>

        <div className="gov-links">
          <a href="https://emigrate.gov.in/ext/raList.action" target="_blank" rel="noopener noreferrer" className="gov-link">
            <Landmark size={18} /> Verify Registered Agents — eMigrate Portal
          </a>
          <a href="https://www.mea.gov.in/ras" target="_blank" rel="noopener noreferrer" className="gov-link">
            <FileText size={18} /> MEA Recruiting Agents List
          </a>
          <a href="https://www.mea.gov.in/emigration-abroad-for-emp" target="_blank" rel="noopener noreferrer" className="gov-link">
            <Globe size={18} /> MEA Emigration Guidelines
          </a>
          <a href="https://www.mea.gov.in/press-releases?dtl%2F37425%2FAdvisory_on_overcharging_by_agents_for_overseas_recruitment_offering_fake_overseas_jobs_and_illegal_recruitment=" target="_blank" rel="noopener noreferrer" className="gov-link">
            <Megaphone size={18} /> MEA Fraud Advisory
          </a>
        </div>
      </section>

      {/* BOOKING FORM */}
      <section className="section-padding form-section" id="book">
        <div className="form-container">
          <div className="form-header">
            <h2>Book Your Advisory Session</h2>
            <p>Fill in your details below. We'll reach out within 24 hours.</p>
          </div>

          <div className="form-body">
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Personal Info */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName"><User size={14} style={{ marginRight: '6px' }} /> Full Name <span className="required">*</span></label>
                  <input 
                    type="text" 
                    id="fullName" 
                    placeholder="Enter your full name" 
                    value={formData.fullName} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone"><Phone size={14} style={{ marginRight: '6px' }} /> Phone / WhatsApp <span className="required">*</span></label>
                  <input 
                    type="tel" 
                    id="phone" 
                    placeholder="+91 98765 43210" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email"><Mail size={14} style={{ marginRight: '6px' }} /> Email Address <span className="required">*</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="your@email.com" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age"><Award size={14} style={{ marginRight: '6px' }} /> Age <span className="required">*</span></label>
                  <input 
                    type="number" 
                    id="age" 
                    placeholder="e.g. 18" 
                    min="14" 
                    max="60" 
                    value={formData.age} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row full">
                <div className="form-group">
                  <label htmlFor="address"><MapPin size={14} style={{ marginRight: '6px' }} /> Address / City / State <span className="required">*</span></label>
                  <input 
                    type="text" 
                    id="address" 
                    placeholder="Your city, state, country" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>

              {/* Education */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="education"><GraduationCap size={14} style={{ marginRight: '6px' }} /> Highest Education <span className="required">*</span></label>
                  <CustomSelect 
                    id="education" 
                    value={formData.education} 
                    onChange={handleInputChange} 
                    options={EDUCATION_OPTIONS} 
                    placeholder="Select your education" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="currentStatus"><Briefcase size={14} style={{ marginRight: '6px' }} /> Current Status <span className="required">*</span></label>
                  <CustomSelect 
                    id="currentStatus" 
                    value={formData.currentStatus} 
                    onChange={handleInputChange} 
                    options={STATUS_OPTIONS} 
                    placeholder="Select current status" 
                    required 
                  />
                </div>
              </div>

              <div className="form-row full">
                <div className="form-group">
                  <label htmlFor="skills">Skills / Trade (if any)</label>
                  <input 
                    type="text" 
                    id="skills" 
                    placeholder="e.g. Welding, Electrician, Plumbing, Cooking, Driving..." 
                    value={formData.skills} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              {/* Services Selector */}
              <div className="service-select-container">
                <span className="service-select-label">Select Service(s) <span className="required">*</span></span>
                <div className="service-select-grid">
                  {servicesList.map(service => (
                    <label className="service-option-card" key={service._id}>
                      <input 
                        type="checkbox" 
                        checked={!!selectedServices[service.key]} 
                        onChange={() => handleServiceChange(service.key)} 
                      />
                      <div className="service-option-content">
                        <div className="service-option-icon">
                          {Icons[service.icon] ? React.createElement(Icons[service.icon], { size: 24 }) : <span>{service.icon}</span>}
                        </div>
                        <div className="service-option-title">{service.title}</div>
                        <div className="service-option-desc">Rs.{service.price}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* CONDITIONAL SECTIONS */}
              {/* Career details */}
              {selectedServices.career && (
                <div className="conditional-service-fields">
                  <h4>🎯 Career Guidance details</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="careerIndustry">Select Industry</label>
                      <CustomSelect 
                        id="careerIndustry" 
                        value={formData.careerIndustry} 
                        onChange={handleInputChange} 
                        options={INDUSTRY_DROPDOWN_OPTIONS} 
                        placeholder="Choose an industry" 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="careerJobTitle">Target Position</label>
                      <CustomSelect 
                        id="careerJobTitle" 
                        value={formData.careerJobTitle} 
                        onChange={handleInputChange} 
                        options={formData.careerIndustry && JOBS_BY_INDUSTRY[formData.careerIndustry] ? JOBS_BY_INDUSTRY[formData.careerIndustry].map(job => ({ value: job, label: job })) : []} 
                        placeholder="Choose role" 
                        disabled={!formData.careerIndustry}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Visa details */}
              {selectedServices.visa && (
                <div className="conditional-service-fields">
                  <h4>✈️ Migration & Visa Details</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="preferredCountry">Preferred Country</label>
                      <CustomSelect 
                        id="preferredCountry" 
                        value={formData.preferredCountry} 
                        onChange={handleInputChange} 
                        options={COUNTRY_OPTIONS} 
                        placeholder="Select country" 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="passport">Do you have a valid Passport?</label>
                      <CustomSelect 
                        id="passport" 
                        value={formData.passport} 
                        onChange={handleInputChange} 
                        options={PASSPORT_OPTIONS} 
                        placeholder="Select" 
                      />
                    </div>
                  </div>

                  <div className="form-row full">
                    <div className="form-group">
                      <label htmlFor="overseasExp">Any previous overseas experience?</label>
                      <CustomSelect 
                        id="overseasExp" 
                        value={formData.overseasExp} 
                        onChange={handleInputChange} 
                        options={EXP_OPTIONS} 
                        placeholder="Select" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Job placement details */}
              {selectedServices.placement && (
                <div className="conditional-service-fields">
                  <h4>💼 Job Placement Details</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="placementIndustry">Preferred Industry</label>
                      <CustomSelect 
                        id="placementIndustry" 
                        value={formData.placementIndustry} 
                        onChange={handleInputChange} 
                        options={INDUSTRY_DROPDOWN_OPTIONS} 
                        placeholder="Choose an industry" 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Upload CV / Resume (optional)</label>
                      <div className="file-upload-input">
                        <Upload size={20} />
                        <span className="file-hint">
                          {cvFile ? `Selected: ${cvFile.name}` : 'Click or drop PDF, DOC, DOCX - Max 5MB'}
                        </span>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="form-row full">
                <div className="form-group">
                  <label htmlFor="notes">Anything specific you want to discuss?</label>
                  <textarea 
                    id="notes" 
                    placeholder="Tell us your situation, goals, questions..." 
                    value={formData.notes} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Price calculations */}
              {selectedCount > 0 && (
                <div className="payment-summary">
                  <div className="payment-row">
                    <span>Advisory Session (45 min)</span>
                    <span>{selectedCount} service(s) selected</span>
                  </div>
                  <div className="payment-row total">
                    <span>Total Fee</span>
                    <span>Rs.{totalAmount}</span>
                  </div>
                </div>
              )}

              <button 
                type="button" 
                className="submit-btn" 
                onClick={handleInitiateBooking}
                disabled={selectedCount === 0 || loading}
              >
                {loading ? 'Processing Booking...' : selectedCount > 0 ? `Pay Rs.${totalAmount} & Book Session` : 'Select a service to continue'}
              </button>

              <p className="secure-note">
                <ShieldCheck size={14} /> Secure payment checkout via Razorpay gateway.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <img src="/Routeup Logo.png" alt="RouteUp Logo" style={{ height: '44px', objectFit: 'contain' }} />
          </div>
          <p className="footer-tagline">Career Advisory & Migration Guidance</p>
          
          <div className="footer-links">
            <a href="#about">About Us</a>
            <a href="#services">Services</a>
            <a href="#education">Visa Guide</a>
            <a href="#awareness">Scam Alerts</a>
            <button onClick={scrollToForm} style={{ color: '#fff', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer' }}>Book Session</button>
          </div>

          <div className="footer-contact">
            <p><span onDoubleClick={onAdminClick} style={{ cursor: 'pointer', userSelect: 'none' }}>Questions?</span> Reach us at <a href="mailto:hello@routeup.co.in">hello@routeup.co.in</a></p>
          </div>
          
          <p className="footer-bottom">© 2026 RouteUp. All rights reserved.</p>
        </div>
      </footer>

      {/* SUCCESS CONFIRMATION MODAL */}
      {paymentStep === 'success' && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-modal-icon">
              <Check size={36} />
            </div>
            <h3>Booking Confirmed!</h3>
            <p>Thank you! Your advisory session has been booked. Our team will contact you within 24 hours on WhatsApp to schedule your 45-minute session.</p>
            <button onClick={handleCloseModal}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
