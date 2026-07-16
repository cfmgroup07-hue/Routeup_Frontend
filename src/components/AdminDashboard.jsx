import React, { useState, useEffect, useRef } from 'react';
import { API_URL, SOCKET_URL } from '../config';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { 
  Users, DollarSign, Clock, CheckCircle, Search, 
  Filter, LogOut, ArrowRight, Download, Calendar, 
  MapPin, GraduationCap, Briefcase, FileText, Bell,
  Plus, Edit, Trash2, Globe, FileCheck, Eye, Video, UploadCloud,
  Target, Award, Plane, BookOpen, Compass, ChevronLeft, ChevronRight, Mail, Send,
  Settings, User, Lock, Camera
} from 'lucide-react';
import { CountryList, getCountryFlagCode, getFlagImageUrl } from '../utils/countries';
import CustomSelect from './CustomSelect';
import { getAllStudyAbroadDocs } from '../data/studyAbroadData';

const BOOKING_STATUS_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Completed', label: 'Completed' },
];

const PAYMENT_FILTER_OPTIONS = [
  { value: '', label: 'All Payments' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Pending', label: 'Pending' },
];

const EDIT_STATUS_OPTIONS = [
  { value: 'Student', label: 'Student' },
  { value: 'Unemployed - Looking for work', label: 'Unemployed - Looking for work' },
  { value: 'Working - Want to switch', label: 'Working - Want to switch' },
  { value: 'Working - Want overseas job', label: 'Working - Want overseas job' },
  { value: 'Freelancer / Self-employed', label: 'Freelancer / Self-employed' },
  { value: 'Employed', label: 'Employed' },
  { value: 'Unemployed', label: 'Unemployed' },
  { value: 'Business Owner', label: 'Business Owner' },
  { value: 'Other', label: 'Other' },
];

const POPULAR_PATHWAY_COUNTRIES = [
  { name: 'UAE / Dubai', code: 'ae' },
  { name: 'Saudi Arabia', code: 'sa' },
  { name: 'Qatar', code: 'qa' },
  { name: 'Australia', code: 'au' },
  { name: 'Canada', code: 'ca' },
  { name: 'Germany', code: 'de' },
  { name: 'United Kingdom', code: 'gb' },
  { name: 'United States', code: 'us' },
  { name: 'New Zealand', code: 'nz' },
  { name: 'Singapore', code: 'sg' },
  { name: 'Norway', code: 'no' },
  { name: 'India', code: 'in' }
];

const IconMap = {
  Briefcase,
  GraduationCap,
  FileText,
  Globe,
  MapPin,
  Target,
  Award,
  CheckCircle,
  Users,
  Plane,
  BookOpen,
};

const AdminDashboard = ({ onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleUnauthorized = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminAvatar');
    toast.error('Session expired. Please log in again.');
    onLogout();
  };
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [socketNotification, setSocketNotification] = useState(null);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  // Counselor notes & status edit state (for booking modal)
  const [modalStatus, setModalStatus] = useState('');
  const [modalNotes, setModalNotes] = useState('');

  // Active Tab: 'enquiries', 'payments', 'services', 'visa-pathways', 'australia-pr'
  const [activeTab, setActiveTab] = useState('enquiries');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Australia PR leads
  const [prLeads, setPrLeads] = useState([]);
  const [prSearchTerm, setPrSearchTerm] = useState('');
  const [selectedPrLead, setSelectedPrLead] = useState(null);
  const [prModalMode, setPrModalMode] = useState(null); // 'view' | 'edit' | 'mail'
  const [prLeadStatus, setPrLeadStatus] = useState('New');
  const [prLeadNotes, setPrLeadNotes] = useState('');
  const [prLeadsLoading, setPrLeadsLoading] = useState(false);
  const [prEditData, setPrEditData] = useState(null);
  const [prMailMessage, setPrMailMessage] = useState('');
  const [prMailFiles, setPrMailFiles] = useState([]);
  const [prMailSending, setPrMailSending] = useState(false);

  // Study Abroad / Students leads
  const [studentLeads, setStudentLeads] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentCountryFilter, setStudentCountryFilter] = useState('');
  const [selectedStudentLead, setSelectedStudentLead] = useState(null);
  const [studentModalMode, setStudentModalMode] = useState(null); // 'view' | 'edit'
  const [studentLeadsLoading, setStudentLeadsLoading] = useState(false);
  const [studentEditData, setStudentEditData] = useState(null);
  const [studentMailMessage, setStudentMailMessage] = useState('');
  const [studentWrongDocs, setStudentWrongDocs] = useState([]);
  const [studentMailSending, setStudentMailSending] = useState(false);

  // Admin profile / settings
  const [adminProfile, setAdminProfile] = useState({
    name: localStorage.getItem('adminName') || 'Admin',
    email: localStorage.getItem('adminEmail') || '',
    avatar: localStorage.getItem('adminAvatar') || '',
  });
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminSettingsTab, setAdminSettingsTab] = useState('profile'); // 'profile' | 'password'
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Services & Visa Pathways Lists
  const [servicesList, setServicesList] = useState([]);
  const [visaPathwaysList, setVisaPathwaysList] = useState([]);

  // Service CRUD Modals & form fields
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceKey, setServiceKey] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceIcon, setServiceIcon] = useState('');

  // Visa Pathway CRUD Modals & form fields
  const [isPathwayModalOpen, setIsPathwayModalOpen] = useState(false);
  const [editingPathway, setEditingPathway] = useState(null);
  const [pathwayCountryName, setPathwayCountryName] = useState('');
  const [pathwayCountryFlag, setPathwayCountryFlag] = useState('');
  const [pathwayVisaTypes, setPathwayVisaTypes] = useState('');
  const [pathwayDescription, setPathwayDescription] = useState('');
  const [pathwayDocBadgeText, setPathwayDocBadgeText] = useState('');
  const [pathwayCountrySearch, setPathwayCountrySearch] = useState('');
  const [isPathwayCountryOpen, setIsPathwayCountryOpen] = useState(false);
  const pathwayCountryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pathwayCountryRef.current && !pathwayCountryRef.current.contains(event.target)) {
        setIsPathwayCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredPathwayCountries = () => {
    const query = pathwayCountrySearch.trim().toLowerCase();
    if (!query) return POPULAR_PATHWAY_COUNTRIES;

    const aliasMatches = POPULAR_PATHWAY_COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(query)
    );
    const listMatches = CountryList.filter((country) =>
      country.name.toLowerCase().includes(query)
    ).map((country) => ({ name: country.name, code: country.code }));

    const merged = [...aliasMatches, ...listMatches].filter(
      (country, index, arr) => arr.findIndex((item) => item.code === country.code && item.name === country.name) === index
    );

    return merged.slice(0, 15);
  };

  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleLink, setScheduleLink] = useState('');
  const [scheduleDateTime, setScheduleDateTime] = useState('');

  const [isPostMeetingModalOpen, setIsPostMeetingModalOpen] = useState(false);
  const [postMeetingNotes, setPostMeetingNotes] = useState('');
  const [postMeetingFiles, setPostMeetingFiles] = useState([]);

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState(null);

  const openEditProfileModal = (booking) => {
    setEditProfileData({
      ...booking,
      skills: booking.skills || ''
    });
    setIsEditProfileModalOpen(true);
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/bookings/${editProfileData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editProfileData.name,
          phone: editProfileData.phone,
          email: editProfileData.email,
          age: editProfileData.age,
          address: editProfileData.address,
          education: editProfileData.education,
          currentStatus: editProfileData.currentStatus,
          skills: editProfileData.skills
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
        if (selectedBooking && selectedBooking._id === updated._id) {
          setSelectedBooking(updated);
        }
        setIsEditProfileModalOpen(false);
      } else {
        const err = await res.json();
        toast.error('Failed: ' + err.message);
      }
    } catch (err) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const openScheduleModal = (booking) => {
    setSelectedBooking(booking);
    setScheduleLink(booking.meetingDetails?.link || '');
    if (booking.meetingDetails?.dateTime) {
      const dt = new Date(booking.meetingDetails.dateTime);
      dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
      setScheduleDateTime(dt.toISOString().slice(0, 16));
    } else {
      setScheduleDateTime('');
    }
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/bookings/${selectedBooking._id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ link: scheduleLink, dateTime: scheduleDateTime })
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b._id === updated.booking._id ? updated.booking : b));
        toast.success('Meeting scheduled and email sent!');
        setIsScheduleModalOpen(false);
      } else {
        const err = await res.json();
        toast.error('Failed: ' + err.message);
      }
    } catch (err) {
      toast.error('Error scheduling');
    } finally {
      setLoading(false);
    }
  };

  const openPostMeetingModal = (booking) => {
    setSelectedBooking(booking);
    setPostMeetingNotes(booking.postMeetingDetails?.notes || '');
    setPostMeetingFiles([]);
    setIsPostMeetingModalOpen(true);
  };

  const handlePostMeetingFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setPostMeetingFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  };

  const removePostMeetingFile = (index) => {
    setPostMeetingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostMeetingSubmit = async (e) => {
    e.preventDefault();
    if (!postMeetingNotes.trim() && postMeetingFiles.length === 0) {
      toast.error('Please add session notes or upload at least one file.');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('notes', postMeetingNotes);
    postMeetingFiles.forEach((file) => formData.append('documents', file));

    try {
      const res = await fetch(`${API_URL}/api/bookings/${selectedBooking._id}/post-meeting`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b._id === updated.booking._id ? updated.booking : b));
        toast.success('Notes uploaded and email sent!');
        setIsPostMeetingModalOpen(false);
      } else {
        const err = await res.json();
        toast.error('Failed: ' + err.message);
      }
    } catch (err) {
      toast.error('Error uploading post meeting details');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteBooking = async (id) => {
    if (!window.confirm('Mark this process as Complete?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
         const updated = await res.json();
         setBookings(prev => prev.map(b => b._id === updated.booking._id ? updated.booking : b));
         toast.success('Booking marked as complete');
      } else toast.error('Failed to mark complete');
    } catch (err) {
      toast.error('Error completing booking');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setBookings(prev => prev.filter(b => b._id !== id));
        toast.success('Booking deleted successfully');
      } else {
        toast.error('Failed to delete booking');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting booking');
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else if (response.status === 401) {
        handleUnauthorized();
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrLeads = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setPrLeadsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/pr-leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPrLeads(data);
      } else if (response.status === 401) {
        handleUnauthorized();
      }
    } catch (error) {
      console.error('Failed to fetch PR leads:', error);
    } finally {
      setPrLeadsLoading(false);
    }
  };

  const handleDeletePrLead = async (id) => {
    if (!window.confirm('Delete this Australia PR lead?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/pr-leads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setPrLeads((prev) => prev.filter((l) => l._id !== id));
        if (selectedPrLead?._id === id) closePrLeadModal();
        toast.success('PR lead deleted');
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        toast.error('Failed to delete lead');
      }
    } catch {
      toast.error('Error deleting lead');
    }
  };

  const openPrLeadModal = (lead, mode = 'view') => {
    setSelectedPrLead(lead);
    setPrModalMode(mode);
    setPrLeadStatus(lead.status || 'New');
    setPrLeadNotes(lead.adminNotes || '');
    setPrEditData({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      existingExperience: lead.existingExperience || '',
      occupation: lead.occupation || '',
      anzsco: lead.anzsco || '',
      assessingBody: lead.assessingBody || '',
      origin: lead.origin || '',
      country: lead.country || '',
      state: lead.state || '',
      status: lead.status || 'New',
      adminNotes: lead.adminNotes || '',
    });
    setPrMailMessage(lead.adminNotes || '');
    setPrMailFiles([]);
  };

  const handlePrDocDownload = async (doc) => {
    if (!doc?.filePath) return;
    try {
      const response = await fetch(`${API_URL}${doc.filePath}`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName || doc.title || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download file');
      window.open(`${API_URL}${doc.filePath}`, '_blank', 'noopener,noreferrer');
    }
  };

  const closePrLeadModal = () => {
    setSelectedPrLead(null);
    setPrModalMode(null);
    setPrEditData(null);
    setPrMailFiles([]);
    setPrMailSending(false);
  };

  const handleUpdatePrLead = async (e) => {
    e.preventDefault();
    if (!selectedPrLead) return;
    const token = localStorage.getItem('adminToken');
    try {
      const payload =
        prModalMode === 'edit' && prEditData
          ? { ...prEditData }
          : { status: prLeadStatus, adminNotes: prLeadNotes };

      const response = await fetch(`${API_URL}/api/pr-leads/${selectedPrLead._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const updated = await response.json();
        setPrLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
        setSelectedPrLead(updated);
        setPrLeadStatus(updated.status || 'New');
        setPrLeadNotes(updated.adminNotes || '');
        toast.success(prModalMode === 'edit' ? 'Lead details updated' : 'PR lead updated');
        if (prModalMode === 'edit') setPrModalMode('view');
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        toast.error('Failed to update lead');
      }
    } catch {
      toast.error('Error updating lead');
    }
  };

  const handleSendPrMail = async (e) => {
    e.preventDefault();
    if (!selectedPrLead) return;
    if (!prMailMessage.trim() && prMailFiles.length === 0) {
      toast.error('Please add notes or upload at least one file.');
      return;
    }

    const token = localStorage.getItem('adminToken');
    setPrMailSending(true);
    try {
      const formData = new FormData();
      formData.append('notes', prMailMessage);
      prMailFiles.forEach((file) => formData.append('documents', file));

      const response = await fetch(`${API_URL}/api/pr-leads/${selectedPrLead._id}/send-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        if (data.lead) {
          setPrLeads((prev) => prev.map((l) => (l._id === data.lead._id ? data.lead : l)));
          setSelectedPrLead(data.lead);
        }
        toast.success('Notes uploaded and email sent!');
        closePrLeadModal();
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        toast.error('Failed: ' + (data.message || 'Could not send email'));
      }
    } catch {
      toast.error('Error uploading follow-up details');
    } finally {
      setPrMailSending(false);
    }
  };

  const fetchStudentLeads = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setStudentLeadsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/study-abroad-leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStudentLeads(data);
      } else if (response.status === 401) {
        handleUnauthorized();
      }
    } catch (error) {
      console.error('Failed to fetch study abroad leads:', error);
    } finally {
      setStudentLeadsLoading(false);
    }
  };

  const handleDeleteStudentLead = async (id) => {
    if (!window.confirm('Delete this student lead?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/study-abroad-leads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setStudentLeads((prev) => prev.filter((l) => l._id !== id));
        if (selectedStudentLead?._id === id) closeStudentLeadModal();
        toast.success('Student lead deleted');
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        toast.error('Failed to delete lead');
      }
    } catch {
      toast.error('Error deleting lead');
    }
  };

  const openStudentLeadModal = (lead, mode = 'view') => {
    setSelectedStudentLead(lead);
    setStudentModalMode(mode);
    setStudentEditData({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      applyingCourse: lead.applyingCourse || '',
      targetUniversity: lead.targetUniversity || '',
      country: lead.country || '',
      status: lead.status || 'New',
      adminNotes: lead.adminNotes || '',
    });
    setStudentMailMessage('');
    setStudentWrongDocs(
      (lead.uploadedDocuments || [])
        .filter((d) => d.needsReupload)
        .map((d) => d.title)
    );
  };

  const closeStudentLeadModal = () => {
    setSelectedStudentLead(null);
    setStudentModalMode(null);
    setStudentEditData(null);
    setStudentMailMessage('');
    setStudentWrongDocs([]);
    setStudentMailSending(false);
  };

  const handleUpdateStudentLead = async (e) => {
    e.preventDefault();
    if (!selectedStudentLead || !studentEditData) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/study-abroad-leads/${selectedStudentLead._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentEditData),
      });
      if (response.ok) {
        const updated = await response.json();
        setStudentLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
        setSelectedStudentLead(updated);
        toast.success('Student lead updated');
        setStudentModalMode('view');
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        toast.error('Failed to update lead');
      }
    } catch {
      toast.error('Error updating lead');
    }
  };

  const handleStudentDocDownload = async (doc) => {
    if (!doc?.filePath) return;
    try {
      const response = await fetch(`${API_URL}${doc.filePath}`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download file');
      window.open(`${API_URL}${doc.filePath}`, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleStudentWrongDoc = (title) => {
    setStudentWrongDocs((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  /** Full checklist for country + any extra titles already on the lead (uploaded or missing). */
  const getStudentReuploadDocOptions = (lead) => {
    if (!lead) return [];
    const checklist = getAllStudyAbroadDocs(lead.country || '') || [];
    const byTitle = new Map();
    checklist.forEach((title) => {
      byTitle.set(title, { title, fileName: '', filePath: '', needsReupload: false });
    });
    (lead.uploadedDocuments || []).forEach((doc) => {
      if (!doc?.title) return;
      const prev = byTitle.get(doc.title) || { title: doc.title };
      byTitle.set(doc.title, { ...prev, ...doc });
    });
    return Array.from(byTitle.values());
  };

  const handleSendStudentReuploadMail = async (e) => {
    e.preventDefault();
    if (!selectedStudentLead) return;
    if (studentWrongDocs.length === 0) {
      toast.error('Select at least one document to request.');
      return;
    }

    const token = localStorage.getItem('adminToken');
    setStudentMailSending(true);
    try {
      const response = await fetch(
        `${API_URL}/api/study-abroad-leads/${selectedStudentLead._id}/request-reupload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentTitles: studentWrongDocs,
            message: studentMailMessage.trim(),
          }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok || response.status === 502) {
        if (data.lead) {
          setStudentLeads((prev) => prev.map((l) => (l._id === data.lead._id ? data.lead : l)));
          setSelectedStudentLead(data.lead);
        }
        if (response.ok) {
          toast.success('Re-upload email sent to student');
          closeStudentLeadModal();
        } else {
          toast.error(data.message || 'Email failed — link was still created');
          if (data.reuploadUrl) {
            try {
              await navigator.clipboard.writeText(data.reuploadUrl);
              toast.success('Re-upload link copied to clipboard');
            } catch {
              /* ignore */
            }
          }
        }
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        toast.error(data.message || 'Failed to send email');
      }
    } catch {
      toast.error('Error sending re-upload email');
    } finally {
      setStudentMailSending(false);
    }
  };

  const syncAdminProfileLocal = (next) => {
    setAdminProfile(next);
    localStorage.setItem('adminName', next.name || 'Admin');
    localStorage.setItem('adminEmail', next.email || '');
    if (next.avatar) localStorage.setItem('adminAvatar', next.avatar);
    else localStorage.removeItem('adminAvatar');
  };

  useEffect(() => {
    const loadAdminProfile = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        syncAdminProfileLocal({
          name: data.name || 'Admin',
          email: data.email || '',
          avatar: data.avatar || '',
        });
      } catch {
        /* keep cached values */
      }
    };
    loadAdminProfile();
  }, []);

  const openAdminSettings = async () => {
    setAdminSettingsTab('profile');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setAvatarFile(null);
    setRemoveAvatar(false);
    setShowAdminSettings(true);

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const next = {
          name: data.name || 'Admin',
          email: data.email || '',
          avatar: data.avatar || '',
        };
        syncAdminProfileLocal(next);
        setProfileForm({ name: next.name, email: next.email });
        setAvatarPreview(next.avatar ? `${API_URL}${next.avatar}` : '');
        return;
      }
    } catch {
      /* fall through to cached values */
    }
    setProfileForm({
      name: adminProfile.name || 'Admin',
      email: adminProfile.email || '',
    });
    setAvatarPreview(adminProfile.avatar ? `${API_URL}${adminProfile.avatar}` : '');
  };

  const closeAdminSettings = () => {
    setShowAdminSettings(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setAvatarFile(null);
    setAvatarPreview('');
    setRemoveAvatar(false);
    setProfileSaving(false);
    setPasswordSaving(false);
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0] || null;
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo must be under 5MB');
      return;
    }
    setAvatarFile(file);
    setRemoveAvatar(false);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setRemoveAvatar(true);
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!profileForm.email.trim() || !profileForm.email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    const token = localStorage.getItem('adminToken');
    setProfileSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', profileForm.name.trim());
      formData.append('email', profileForm.email.trim().toLowerCase());
      if (avatarFile) formData.append('avatar', avatarFile);
      if (removeAvatar) formData.append('removeAvatar', 'true');

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        toast.error(data.message || 'Failed to update profile');
        return;
      }
      const next = {
        name: data.name || profileForm.name,
        email: data.email || profileForm.email,
        avatar: data.avatar || '',
      };
      syncAdminProfileLocal(next);
      setProfileForm({ name: next.name, email: next.email });
      setAvatarFile(null);
      setRemoveAvatar(false);
      setAvatarPreview(next.avatar ? `${API_URL}${next.avatar}` : '');
      toast.success('Profile updated');
    } catch {
      toast.error('Error updating profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const token = localStorage.getItem('adminToken');
    setPasswordSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/password`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 && data.message !== 'Current password is incorrect') {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        toast.error(data.message || 'Failed to change password');
        return;
      }
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch {
      toast.error('Error changing password');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Fetch Services List
  const fetchServicesList = async () => {
    try {
      const response = await fetch(`${API_URL}/api/services`);
      if (response.ok) {
        const data = await response.json();
        setServicesList(data);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  // Fetch Visa Pathways List
  const fetchVisaPathwaysList = async () => {
    try {
      const response = await fetch(`${API_URL}/api/visa-pathways`);
      if (response.ok) {
        const data = await response.json();
        setVisaPathwaysList(data);
      }
    } catch (error) {
      console.error('Failed to fetch visa pathways:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchServicesList();
    fetchVisaPathwaysList();
    fetchPrLeads();
    fetchStudentLeads();

    // Socket.io Connection
    const socket = io(`${SOCKET_URL}`);

    socket.on('connect', () => {
      console.log('Dashboard connected to websocket');
      socket.emit('join_admin_room');
    });

    // Listen for new bookings
    socket.on('new_booking', (newBooking) => {
      console.log('Socket new_booking:', newBooking);
      setBookings(prev => [newBooking, ...prev]);
      
      setSocketNotification({
        title: 'New Booking Request!',
        message: `${newBooking.name} submitted a new request.`,
        booking: newBooking
      });

      // Auto clear notification in 8 seconds
      setTimeout(() => setSocketNotification(null), 8000);
    });

    // Listen for booking updates
    socket.on('booking_updated', (updatedBooking) => {
      console.log('Socket booking_updated:', updatedBooking);
      setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
      
      setSelectedBooking(current => {
        if (current && current._id === updatedBooking._id) {
          return updatedBooking;
        }
        return current;
      });
    });

    // Listen for service updates
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
      setServicesList(prev => prev.filter(s => s._id !== deletedId));
    });

    // Listen for visa pathway updates
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

    socket.on('study_abroad_lead_updated', (updatedLead) => {
      setStudentLeads((prev) => {
        const exists = prev.some((l) => l._id === updatedLead._id);
        if (!exists) return [updatedLead, ...prev];
        return prev.map((l) => (l._id === updatedLead._id ? updatedLead : l));
      });
      setSelectedStudentLead((current) =>
        current && current._id === updatedLead._id ? updatedLead : current
      );
      setSocketNotification({
        title: 'Student documents updated',
        message: `${updatedLead.name} re-uploaded study abroad documents.`,
        booking: null,
        openStudents: true,
      });
      setTimeout(() => setSocketNotification(null), 8000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update Status & Counselor Notes
  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/bookings/${selectedBooking._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: modalStatus,
          counselorNotes: modalNotes
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
        setSelectedBooking(updated);
        toast.success('Booking updated successfully!');
      } else {
        toast.error('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Error updating booking');
    }
  };

  // Open modal and prepopulate values
  const openModal = (booking) => {
    setSelectedBooking(booking);
    setModalStatus(booking.status);
    setModalNotes(booking.counselorNotes || '');
  };

  // Service CRUD Modals
  const openServiceAddModal = () => {
    setEditingService(null);
    setServiceTitle('');
    setServiceKey('');
    setServiceDescription('');
    setServicePrice('');
    setServiceIcon('Briefcase');
    setIsIconDropdownOpen(false);
    setIsServiceModalOpen(true);
  };

  const openServiceEditModal = (service) => {
    setEditingService(service);
    setServiceTitle(service.title);
    setServiceKey(service.key);
    setServiceDescription(service.description);
    setServicePrice(service.price);
    setServiceIcon(service.icon);
    setIsIconDropdownOpen(false);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const url = editingService 
      ? `${API_URL}/api/services/${editingService._id}`
      : `${API_URL}/api/services`;
    const method = editingService ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: serviceTitle,
          key: serviceKey,
          description: serviceDescription,
          price: Number(servicePrice),
          icon: serviceIcon
        })
      });

      if (response.ok) {
        setIsServiceModalOpen(false);
        setEditingService(null);
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        const err = await response.json();
        toast.error(`Failed to save service: ${err.message}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saving service');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        toast.error('Failed to delete service');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting service');
    }
  };

  // Visa Pathway CRUD Modals
  const openPathwayAddModal = () => {
    setEditingPathway(null);
    setPathwayCountryName('');
    setPathwayCountryFlag('');
    setPathwayCountrySearch('');
    setPathwayVisaTypes('');
    setPathwayDescription('');
    setPathwayDocBadgeText('Detailed visa document provided');
    setIsPathwayCountryOpen(false);
    setIsPathwayModalOpen(true);
  };

  const openPathwayEditModal = (pathway) => {
    setEditingPathway(pathway);
    setPathwayCountryName(pathway.countryName);
    setPathwayCountryFlag(getCountryFlagCode(pathway.countryName, pathway.countryFlag));
    setPathwayCountrySearch(pathway.countryName);
    setPathwayVisaTypes(pathway.visaTypes.join(', '));
    setPathwayDescription(pathway.description);
    setPathwayDocBadgeText(pathway.docBadgeText);
    setIsPathwayCountryOpen(false);
    setIsPathwayModalOpen(true);
  };

  const handlePathwayCountryChange = (value) => {
    setPathwayCountrySearch(value);
    setPathwayCountryName(value);
    setPathwayCountryFlag(getCountryFlagCode(value));
    setIsPathwayCountryOpen(true);
  };

  const handlePathwayCountrySelect = (country) => {
    setPathwayCountryName(country.name);
    setPathwayCountryFlag(country.code);
    setPathwayCountrySearch(country.name);
    setIsPathwayCountryOpen(false);
  };

  const handleSavePathway = async (e) => {
    e.preventDefault();
    const resolvedFlag = getCountryFlagCode(pathwayCountryName, pathwayCountryFlag);
    if (!resolvedFlag) {
      toast.error('Please select a valid country so the flag can be detected.');
      return;
    }

    const token = localStorage.getItem('adminToken');
    const url = editingPathway 
      ? `${API_URL}/api/visa-pathways/${editingPathway._id}`
      : `${API_URL}/api/visa-pathways`;
    const method = editingPathway ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          countryName: pathwayCountryName,
          countryFlag: getCountryFlagCode(pathwayCountryName, pathwayCountryFlag),
          visaTypes: pathwayVisaTypes,
          description: pathwayDescription,
          docBadgeText: pathwayDocBadgeText
        })
      });

      if (response.ok) {
        setIsPathwayModalOpen(false);
        setEditingPathway(null);
      } else {
        const err = await response.json();
        toast.error(`Failed to save visa pathway: ${err.message}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saving visa pathway');
    }
  };

  const handleDeletePathway = async (id) => {
    if (!window.confirm('Are you sure you want to delete this visa pathway?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/visa-pathways/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        toast.error('Failed to delete visa pathway');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting visa pathway');
    }
  };

  // Calculate Metrics
  const totalBookings = bookings.length;
  const paidBookings = bookings.filter(b => b.paymentStatus === 'Paid');
  const totalRevenue = paidBookings.reduce((sum, b) => sum + b.amount, 0);
  const pendingBookings = bookings.filter(b => b.paymentStatus === 'Pending').length;
  const completedBookings = bookings.filter(b => b.status === 'Completed').length;

  // Filter & Search Logic for Enquiries
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      (booking.skills && booking.skills.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === '' || booking.paymentStatus === paymentFilter;
    const matchesService = serviceFilter === '' || booking.services.includes(serviceFilter);

    return matchesSearch && matchesStatus && matchesPayment && matchesService;
  });

  // Filter & Search Logic for Completed Payments
  const completedPaymentsList = bookings.filter(b => b.paymentStatus === 'Paid').filter(booking => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm);
    return matchesSearch;
  });

  // Pagination Logic
  const currentEnquiries = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalEnquiriesPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const currentPayments = completedPaymentsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPaymentsPages = Math.ceil(completedPaymentsList.length / itemsPerPage);

  const currentServices = servicesList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalServicesPages = Math.ceil(servicesList.length / itemsPerPage);

  const currentPathways = visaPathwaysList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPathwaysPages = Math.ceil(visaPathwaysList.length / itemsPerPage);

  const filteredPrLeads = prLeads.filter((lead) => {
    const q = prSearchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.phone?.includes(prSearchTerm) ||
      lead.occupation?.toLowerCase().includes(q) ||
      lead.assessingBody?.toLowerCase().includes(q)
    );
  });
  const currentPrLeads = filteredPrLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPrLeadsPages = Math.ceil(filteredPrLeads.length / itemsPerPage);

  const studentCountries = [...new Set(studentLeads.map((l) => l.country).filter(Boolean))].sort();
  const filteredStudentLeads = studentLeads.filter((lead) => {
    const q = studentSearchTerm.toLowerCase();
    const matchesSearch =
      lead.name?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.phone?.includes(studentSearchTerm) ||
      lead.applyingCourse?.toLowerCase().includes(q) ||
      lead.country?.toLowerCase().includes(q) ||
      lead.targetUniversity?.toLowerCase().includes(q);
    const matchesCountry = !studentCountryFilter || lead.country === studentCountryFilter;
    return matchesSearch && matchesCountry;
  });
  const currentStudentLeads = filteredStudentLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalStudentLeadsPages = Math.ceil(filteredStudentLeads.length / itemsPerPage);

  const renderPagination = (totalPages) => {
    if (totalPages <= 1) return null;
    return (
      <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', padding: '16px 20px', borderTop: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: currentPage === 1 ? '#f8fafc' : '#ffffff', color: currentPage === 1 ? '#94a3b8' : '#0f172a', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
        >
          Previous
        </button>
        <span style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: currentPage === totalPages ? '#f8fafc' : '#ffffff', color: currentPage === totalPages ? '#94a3b8' : '#0f172a', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="admin-sidebar-brand" style={{ gap: '8px' }}>
          <img src="/Routeup Logo.png" alt="RouteUp Logo" style={{ height: '36px', objectFit: 'contain', display: isSidebarCollapsed ? 'none' : 'block' }} />
          {isSidebarCollapsed && <div style={{ fontWeight: '900', color: '#0d7c3d', fontSize: '24px' }}>R</div>}
          <span className="admin-sidebar-badge">Console</span>
        </div>

        <nav className="admin-sidebar-nav">
          <button 
            className={`admin-sidebar-nav-btn ${activeTab === 'enquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('enquiries')}
          >
            <Users size={18} style={{ flexShrink: 0 }} />
            <span className="nav-label">Enquiries</span>
          </button>
          <button 
            className={`admin-sidebar-nav-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <DollarSign size={18} style={{ flexShrink: 0 }} />
            <span className="nav-label">Completed Payments</span>
          </button>
          <button 
            className={`admin-sidebar-nav-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Briefcase size={18} style={{ flexShrink: 0 }} />
            <span className="nav-label">Manage Services</span>
          </button>
          <button 
            className={`admin-sidebar-nav-btn ${activeTab === 'visa-pathways' ? 'active' : ''}`}
            onClick={() => setActiveTab('visa-pathways')}
          >
            <Globe size={18} style={{ flexShrink: 0 }} />
            <span className="nav-label">Manage Visa Pathways</span>
          </button>
          <button 
            className={`admin-sidebar-nav-btn ${activeTab === 'australia-pr' ? 'active' : ''}`}
            onClick={() => setActiveTab('australia-pr')}
          >
            <Plane size={18} style={{ flexShrink: 0 }} />
            <span className="nav-label">Australia PR Leads</span>
          </button>
          <button 
            className={`admin-sidebar-nav-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <GraduationCap size={18} style={{ flexShrink: 0 }} />
            <span className="nav-label">Students</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-user-avatar">
              {adminProfile.avatar ? (
                <img src={`${API_URL}${adminProfile.avatar}`} alt="" />
              ) : (
                (adminProfile.name || adminProfile.email || 'A').charAt(0).toUpperCase()
              )}
            </div>
            <div className="admin-sidebar-user-meta">
              <span className="admin-sidebar-user-name">{adminProfile.name || 'Admin'}</span>
              <span className="admin-sidebar-user-email">{adminProfile.email || '—'}</span>
            </div>
          </div>
          <button type="button" className="admin-sidebar-settings-btn" onClick={openAdminSettings}>
            <Settings size={16} style={{ flexShrink: 0 }} />
            <span>Settings</span>
          </button>
          <button className="admin-sidebar-logout-btn" onClick={onLogout}>
            <LogOut size={16} style={{ flexShrink: 0 }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT REGION */}
      <div className="admin-main-content">
        <header className="admin-header">
          <h2>
            {activeTab === 'enquiries' && 'Candidate Enquiries'}
            {activeTab === 'payments' && 'Completed Payments'}
            {activeTab === 'services' && 'Advisory Services Catalog'}
            {activeTab === 'visa-pathways' && 'Visa Pathways & Country Guidance'}
            {activeTab === 'australia-pr' && 'Australia PR Leads'}
            {activeTab === 'students' && 'Students — Study Abroad'}
          </h2>
        </header>

        {/* LIVE SOCKET TOAST NOTIFICATION */}
        {socketNotification && (
          <div className="socket-notification">
            <Bell className="socket-notification-icon" size={24} />
            <div className="socket-notification-body">
              <h5>{socketNotification.title}</h5>
              <p>{socketNotification.message}</p>
              {socketNotification.booking && (
                <button 
                  className="admin-action-btn" 
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => {
                    openModal(socketNotification.booking);
                    setSocketNotification(null);
                  }}
                >
                  View Booking
                </button>
              )}
              {socketNotification.openStudents && (
                <button
                  className="admin-action-btn"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => {
                    setActiveTab('students');
                    setSocketNotification(null);
                  }}
                >
                  Open Students
                </button>
              )}
            </div>
            <button className="socket-notification-close" onClick={() => setSocketNotification(null)}>✕</button>
          </div>
        )}

        <main className="admin-main">
          {/* METRICS PANEL */}
          <section className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper blue">
                <Users size={24} />
              </div>
              <div className="admin-stat-info">
                <h4>Total Enquiries</h4>
                <p>{totalBookings}</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper green">
                <DollarSign size={24} />
              </div>
              <div className="admin-stat-info">
                <h4>Total Revenue</h4>
                <p>₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper yellow">
                <Clock size={24} />
              </div>
              <div className="admin-stat-info">
                <h4>Pending Payments</h4>
                <p>{pendingBookings}</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper purple">
                <CheckCircle size={24} />
              </div>
              <div className="admin-stat-info">
                <h4>Completed Calls</h4>
                <p>{completedBookings}</p>
              </div>
            </div>
          </section>

          {/* TAB 1: ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <>
              {/* CONTROLS */}
              <section className="admin-controls-card">
                <div className="admin-search-wrapper">
                  <Search className="admin-search-icon" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search enquiries by name, email, skills..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="admin-filters">
                  <CustomSelect
                    id="service-filter"
                    className="admin-portal-select"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    placeholder="All Services"
                    options={[
                      { value: '', label: 'All Services' },
                      ...servicesList.map((s) => ({ value: s.key, label: s.title })),
                    ]}
                  />

                  <CustomSelect
                    id="status-filter"
                    className="admin-portal-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    placeholder="All Call Status"
                    options={[
                      { value: '', label: 'All Call Status' },
                      ...BOOKING_STATUS_OPTIONS,
                    ]}
                  />

                  <CustomSelect
                    id="payment-filter"
                    className="admin-portal-select"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    placeholder="All Payments"
                    options={PAYMENT_FILTER_OPTIONS}
                  />
                </div>
              </section>

              {/* TABLE LISTING */}
              <section className="admin-table-container">
                {loading ? (
                  <div className="no-bookings">Loading enquiries...</div>
                ) : filteredBookings.length === 0 ? (
                  <div className="no-bookings">No enquiries found matching filters</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Candidate</th>
                        <th>Contact Info</th>
                        <th>Requested Services</th>
                        <th>Payment</th>
                        <th>Call Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEnquiries.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={14} style={{ color: '#64748b' }} />
                              {new Date(booking.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: '2-digit'
                              })}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{booking.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Age: {booking.age} | {booking.education}</div>
                          </td>
                          <td>
                            <div>{booking.phone}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{booking.email}</div>
                          </td>
                          <td>
                            <div className="admin-service-pills">
                              {booking.services.map(s => (
                                <span key={s} className="admin-service-pill">
                                  {servicesList.find(ser => ser.key === s)?.title || s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span className={`badge pay-${booking.paymentStatus.toLowerCase()}`}>
                              {booking.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`badge status-${booking.status.toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button className="admin-action-btn icon-only" title="View Details" onClick={() => openModal(booking)} style={{ padding: '6px' }}>
                                <Eye size={16} />
                              </button>
                              
                              <button className="admin-action-btn icon-only" title="Edit Profile" onClick={() => openEditProfileModal(booking)} style={{ padding: '6px', background: '#f59e0b', color: '#fff', border: 'none' }}>
                                <Edit size={16} />
                              </button>
                              
                              {booking.status === 'Completed' && (
                                <button
                                  className="admin-action-btn followup-upload-btn"
                                  title="Upload notes & files and email candidate"
                                  onClick={() => openPostMeetingModal(booking)}
                                >
                                  <UploadCloud size={15} />
                                  <span>Upload</span>
                                </button>
                              )}

                              {booking.status !== 'Completed' && (
                                <>
                                  <button className="admin-action-btn icon-only schedule-btn" title="Schedule Meeting" onClick={() => openScheduleModal(booking)} style={{ padding: '6px', background: '#3b82f6', color: '#fff', border: 'none' }}>
                                    <Video size={16} />
                                  </button>

                                  <button className="admin-action-btn icon-only complete-btn" title="Mark as Complete" onClick={() => handleCompleteBooking(booking._id)} style={{ padding: '6px', background: '#10b981', color: '#fff', border: 'none' }}>
                                    <CheckCircle size={16} />
                                  </button>
                                </>
                              )}

                              <button className="admin-action-btn icon-only delete-btn" title="Delete Booking" onClick={() => handleDeleteBooking(booking._id)} style={{ padding: '6px', background: '#ef4444', color: '#fff', border: 'none' }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {renderPagination(totalEnquiriesPages)}
              </section>
            </>
          )}

          {/* TAB 2: COMPLETED PAYMENTS */}
          {activeTab === 'payments' && (
            <>
              {/* CONTROLS */}
              <section className="admin-controls-card">
                <div className="admin-search-wrapper">
                  <Search className="admin-search-icon" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search payments by candidate..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </section>

              {/* TABLE LISTING */}
              <section className="admin-table-container">
                {loading ? (
                  <div className="no-bookings">Loading payments...</div>
                ) : completedPaymentsList.length === 0 ? (
                  <div className="no-bookings">No completed payments found</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Candidate</th>
                        <th>Services</th>
                        <th>Amount Paid</th>
                        <th>Receipt Status</th>
                        <th>Call Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPayments.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={14} style={{ color: '#64748b' }} />
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{booking.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{booking.phone} | {booking.email}</div>
                          </td>
                          <td>
                            <div className="admin-service-pills">
                              {booking.services.map(s => (
                                <span key={s} className="admin-service-pill">
                                  {servicesList.find(ser => ser.key === s)?.title || s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ fontWeight: '700', color: '#16a34a' }}>
                            ₹{booking.amount}
                          </td>
                          <td>
                            <span className="badge pay-paid">
                              SUCCESS
                            </span>
                          </td>
                          <td>
                            <span className={`badge status-${booking.status.toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button className="admin-action-btn icon-only" title="View Details" onClick={() => openModal(booking)} style={{ padding: '6px' }}>
                                <Eye size={16} />
                              </button>
                              <button className="admin-action-btn icon-only" title="Edit Profile" onClick={() => openEditProfileModal(booking)} style={{ padding: '6px', background: '#f59e0b', color: '#fff', border: 'none' }}>
                                <Edit size={16} />
                              </button>
                              <button className="admin-action-btn icon-only delete-btn" title="Delete Booking" onClick={() => handleDeleteBooking(booking._id)} style={{ padding: '6px', background: '#ef4444', color: '#fff', border: 'none' }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {renderPagination(totalPaymentsPages)}
              </section>
            </>
          )}

          {/* TAB 3: MANAGE SERVICES */}
          {activeTab === 'services' && (
            <>
              {/* CONTROLS */}
              <div className="admin-tab-header-actions">
                <h3>Services Catalog</h3>
                <button className="admin-action-btn" onClick={openServiceAddModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Add New Service
                </button>
              </div>

              {/* SERVICES TABLE */}
              <section className="admin-table-container">
                {servicesList.length === 0 ? (
                  <div className="no-bookings">No services configured. Add one above!</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Icon</th>
                        <th>Title</th>
                        <th>Key / Slug</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th style={{ width: '180px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentServices.map((service) => (
                        <tr key={service._id}>
                          <td style={{ textAlign: 'center', color: '#64748b' }}>
                            {IconMap[service.icon] ? React.createElement(IconMap[service.icon], { size: 20 }) : <span style={{ fontSize: '20px' }}>{service.icon}</span>}
                          </td>
                          <td style={{ fontWeight: '700', color: '#0f172a' }}>{service.title}</td>
                          <td style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 'bold' }}>{service.key}</td>
                          <td style={{ fontWeight: '700', color: '#16a34a' }}>₹{service.price}</td>
                          <td style={{ fontSize: '12.5px', color: '#64748b' }}>{service.description}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="admin-action-btn" onClick={() => openServiceEditModal(service)} style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Edit size={12} /> Edit
                              </button>
                              <button className="admin-action-btn" onClick={() => handleDeleteService(service._id)} style={{ background: '#ef4444', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {renderPagination(totalServicesPages)}
              </section>
            </>
          )}

          {/* TAB 4: MANAGE VISA PATHWAYS */}
          {activeTab === 'visa-pathways' && (
            <>
              {/* CONTROLS */}
              <div className="admin-tab-header-actions">
                <h3>Visa Pathways & Country Guidance</h3>
                <button className="admin-action-btn" onClick={openPathwayAddModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Add New Pathway
                </button>
              </div>

              {/* VISA PATHWAYS TABLE */}
              <section className="admin-table-container">
                {visaPathwaysList.length === 0 ? (
                  <div className="no-bookings">No country visa pathways configured. Add one above!</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Flag</th>
                        <th>Country</th>
                        <th>Visa Types</th>
                        <th>Description</th>
                        <th>Badge Text</th>
                        <th style={{ width: '180px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPathways.map((pathway) => (
                        <tr key={pathway._id}>
                          <td style={{ fontSize: '20px', textAlign: 'center' }}>
                            <img 
                              src={getFlagImageUrl(pathway.countryName, pathway.countryFlag, 'w40')} 
                              alt={`${pathway.countryName} flag`}
                              style={{ width: '28px', borderRadius: '3px', border: '1px solid #e2e8f0' }} 
                              onError={(e) => { e.target.style.display = 'none'; }} 
                            />
                          </td>
                          <td style={{ fontWeight: '700', color: '#0f172a' }}>{pathway.countryName}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {pathway.visaTypes.map((t, i) => (
                                <span key={i} className="admin-service-pill" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>{t}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ fontSize: '12.5px', color: '#64748b' }}>{pathway.description}</td>
                          <td style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}>{pathway.docBadgeText}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="admin-action-btn" onClick={() => openPathwayEditModal(pathway)} style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Edit size={12} /> Edit
                              </button>
                              <button className="admin-action-btn" onClick={() => handleDeletePathway(pathway._id)} style={{ background: '#ef4444', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {renderPagination(totalPathwaysPages)}
              </section>
            </>
          )}

          {/* TAB 5: AUSTRALIA PR LEADS */}
          {activeTab === 'australia-pr' && (
            <>
              <section className="admin-controls-card">
                <div className="admin-search-wrapper">
                  <Search className="admin-search-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, occupation..."
                    value={prSearchTerm}
                    onChange={(e) => setPrSearchTerm(e.target.value)}
                  />
                </div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  {filteredPrLeads.length} lead{filteredPrLeads.length === 1 ? '' : 's'}
                </div>
              </section>

              <section className="admin-table-container">
                {prLeadsLoading ? (
                  <div className="no-bookings">Loading Australia PR leads...</div>
                ) : filteredPrLeads.length === 0 ? (
                  <div className="no-bookings">No Australia PR leads yet</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Candidate</th>
                        <th>Contact</th>
                        <th>Occupation</th>
                        <th>Source</th>
                        <th>Payment</th>
                        <th>Docs</th>
                        <th>Status</th>
                        <th style={{ width: 200 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPrLeads.map((lead) => (
                        <tr key={lead._id}>
                          <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit',
                            })}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{lead.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              {lead.assessingBody || '—'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 13 }}>{lead.phone}</div>
                            <button
                              type="button"
                              onClick={() => openPrLeadModal(lead, 'mail')}
                              title="Compose email"
                              style={{
                                fontSize: 12,
                                color: '#0d7c3d',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                fontWeight: 600,
                                textDecoration: 'underline',
                              }}
                            >
                              {lead.email}
                            </button>
                          </td>
                          <td style={{ fontSize: 13, maxWidth: 200 }}>
                            <div style={{ fontWeight: 600 }}>{lead.occupation}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>ANZSCO {lead.anzsco}</div>
                          </td>
                          <td>
                            <span
                              className="admin-service-pill"
                              style={{
                                background: lead.source === 'document-upload' ? '#eff6ff' : '#fef3c7',
                                color: lead.source === 'document-upload' ? '#1d4ed8' : '#92400e',
                                borderColor: lead.source === 'document-upload' ? '#bfdbfe' : '#fcd34d',
                              }}
                            >
                              {lead.source === 'document-upload' ? 'Doc Upload' : 'Eligibility'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge pay-${(lead.paymentStatus || 'Pending').toLowerCase()}`}>
                              {lead.paymentStatus || 'Pending'}
                            </span>
                            {lead.amount > 0 && (
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                Rs.{lead.amount}
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            {(lead.uploadedDocuments || []).length}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                lead.status === 'New'
                                  ? 'status-new'
                                  : lead.status === 'Contacted'
                                  ? 'status-processing'
                                  : lead.status === 'Converted'
                                  ? 'status-completed'
                                  : 'pay-pending'
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button
                                className="admin-action-btn icon-only"
                                title="View"
                                onClick={() => openPrLeadModal(lead, 'view')}
                                style={{ padding: 6, background: '#0d7c3d', color: '#fff', border: 'none' }}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="admin-action-btn icon-only"
                                title="Edit"
                                onClick={() => openPrLeadModal(lead, 'edit')}
                                style={{ padding: 6, background: '#f59e0b', color: '#fff', border: 'none' }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="admin-action-btn icon-only"
                                title="Send Email"
                                onClick={() => openPrLeadModal(lead, 'mail')}
                                style={{ padding: 6, background: '#2563eb', color: '#fff', border: 'none' }}
                              >
                                <Mail size={14} />
                              </button>
                              <button
                                className="admin-action-btn icon-only delete-btn"
                                title="Delete"
                                onClick={() => handleDeletePrLead(lead._id)}
                                style={{ padding: 6, background: '#ef4444', color: '#fff', border: 'none' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {renderPagination(totalPrLeadsPages)}
              </section>
            </>
          )}

          {activeTab === 'students' && (
            <>
              <section className="admin-controls-card">
                <div className="admin-search-wrapper">
                  <Search className="admin-search-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, course, country..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={studentCountryFilter}
                  onChange={(e) => {
                    setStudentCountryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#334155',
                    background: '#fff',
                    minWidth: 180,
                  }}
                >
                  <option value="">All countries</option>
                  {studentCountries.map((c) => {
                    const count = studentLeads.filter((l) => l.country === c).length;
                    return (
                      <option key={c} value={c}>
                        {c} ({count})
                      </option>
                    );
                  })}
                </select>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  {filteredStudentLeads.length} student{filteredStudentLeads.length === 1 ? '' : 's'}
                </div>
              </section>

              <section className="admin-table-container">
                {studentLeadsLoading ? (
                  <div className="no-bookings">Loading student leads...</div>
                ) : filteredStudentLeads.length === 0 ? (
                  <div className="no-bookings">No study abroad student leads yet</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Student</th>
                        <th>Contact</th>
                        <th>Course</th>
                        <th>Country</th>
                        <th>Docs</th>
                        <th>Status</th>
                        <th style={{ width: 200 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStudentLeads.map((lead) => (
                        <tr key={lead._id}>
                          <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit',
                            })}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{lead.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              {lead.targetUniversity || '—'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 13 }}>{lead.phone}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{lead.email}</div>
                          </td>
                          <td style={{ fontSize: 13, maxWidth: 180 }}>
                            <div style={{ fontWeight: 600 }}>{lead.applyingCourse}</div>
                          </td>
                          <td>
                            <span
                              className="admin-service-pill"
                              style={{
                                background: '#f0faf4',
                                color: '#0d7c3d',
                                borderColor: '#bbf7d0',
                              }}
                            >
                              {lead.country}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            {(lead.uploadedDocuments || []).length}
                            {lead.totalRequired ? (
                              <span style={{ fontWeight: 500, color: '#94a3b8', fontSize: 12 }}>
                                {' '}/ {lead.totalRequired}
                              </span>
                            ) : null}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                lead.status === 'New'
                                  ? 'status-new'
                                  : lead.status === 'Contacted'
                                  ? 'status-processing'
                                  : lead.status === 'Converted'
                                  ? 'status-completed'
                                  : 'pay-pending'
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button
                                className="admin-action-btn icon-only"
                                title="View"
                                onClick={() => openStudentLeadModal(lead, 'view')}
                                style={{ padding: 6, background: '#0d7c3d', color: '#fff', border: 'none' }}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="admin-action-btn icon-only"
                                title="Edit"
                                onClick={() => openStudentLeadModal(lead, 'edit')}
                                style={{ padding: 6, background: '#f59e0b', color: '#fff', border: 'none' }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="admin-action-btn icon-only"
                                title="Request document re-upload"
                                onClick={() => openStudentLeadModal(lead, 'mail')}
                                style={{ padding: 6, background: '#2563eb', color: '#fff', border: 'none' }}
                              >
                                <Mail size={14} />
                              </button>
                              <button
                                className="admin-action-btn icon-only delete-btn"
                                title="Delete"
                                onClick={() => handleDeleteStudentLead(lead._id)}
                                style={{ padding: 6, background: '#ef4444', color: '#fff', border: 'none' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {renderPagination(totalStudentLeadsPages)}
              </section>
            </>
          )}
        </main>
      </div>

      {/* AUSTRALIA PR LEAD MODALS */}
      {selectedPrLead && prModalMode === 'view' && (
        <div className="admin-modal-overlay">
          <div className="admin-modal pr-lead-view-modal">
            <div className="admin-modal-header">
              <div>
                <h3>Australia PR Lead</h3>
                <p className="pr-lead-modal-subtitle">Full application details in review format</p>
              </div>
              <button className="admin-modal-close" onClick={closePrLeadModal}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="pr-lead-view-banner">
                <div>
                  <strong>{selectedPrLead.name}</strong>
                  <span>{selectedPrLead.occupation}</span>
                </div>
                <span className={`badge ${
                  selectedPrLead.status === 'New' ? 'status-new'
                    : selectedPrLead.status === 'Contacted' ? 'status-processing'
                    : selectedPrLead.status === 'Converted' ? 'status-completed'
                    : 'pay-pending'
                }`}>
                  {selectedPrLead.status}
                </span>
              </div>

              <div className="admin-modal-grid">
                <div className="admin-modal-section">
                  <h4><Users size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Candidate</h4>
                  <div className="detail-item"><span className="detail-label">Name:</span><span className="detail-val">{selectedPrLead.name}</span></div>
                  <div className="detail-item"><span className="detail-label">Phone:</span><span className="detail-val">{selectedPrLead.phone}</span></div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <button
                      type="button"
                      className="detail-val pr-email-link"
                      onClick={() => setPrModalMode('mail')}
                    >
                      {selectedPrLead.email}
                    </button>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Source:</span>
                    <span className="detail-val">
                      {selectedPrLead.source === 'document-upload' ? 'Document Upload' : 'Eligibility Check'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment:</span>
                    <span className="detail-val">
                      {selectedPrLead.paymentStatus || 'Pending'}
                      {selectedPrLead.amount > 0 ? ` — Rs.${selectedPrLead.amount}` : ''}
                    </span>
                  </div>
                  {selectedPrLead.paymentId && (
                    <div className="detail-item">
                      <span className="detail-label">Payment ID:</span>
                      <span className="detail-val" style={{ fontSize: 12 }}>{selectedPrLead.paymentId}</span>
                    </div>
                  )}
                  {selectedPrLead.origin && (
                    <div className="detail-item">
                      <span className="detail-label">Applying from:</span>
                      <span className="detail-val">
                        {selectedPrLead.origin === 'offshore'
                          ? `Offshore — ${selectedPrLead.country || 'N/A'}`
                          : `Onshore — ${selectedPrLead.state || 'N/A'}`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="admin-modal-section">
                  <h4><Plane size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Occupation</h4>
                  <div className="detail-item"><span className="detail-label">Occupation:</span><span className="detail-val">{selectedPrLead.occupation}</span></div>
                  <div className="detail-item"><span className="detail-label">ANZSCO:</span><span className="detail-val">{selectedPrLead.anzsco || '—'}</span></div>
                  <div className="detail-item"><span className="detail-label">Assessing body:</span><span className="detail-val">{selectedPrLead.assessingBody || '—'}</span></div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted:</span>
                    <span className="detail-val">{new Date(selectedPrLead.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedPrLead.existingExperience && (
                <div className="admin-modal-section" style={{ marginTop: 16 }}>
                  <h4>Experience / Training Notes</h4>
                  <p className="pr-lead-notes-block">{selectedPrLead.existingExperience}</p>
                </div>
              )}

              <div className="admin-modal-section" style={{ marginTop: 16 }}>
                <h4>Uploaded Documents ({(selectedPrLead.uploadedDocuments || []).length})</h4>
                {(selectedPrLead.uploadedDocuments || []).length === 0 ? (
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No documents attached</p>
                ) : (
                  <div className="pr-lead-doc-list">
                    {selectedPrLead.uploadedDocuments.map((doc, idx) => (
                      <div className="pr-lead-doc-item" key={`${doc.title}-${idx}`}>
                        <span>{doc.title}</span>
                        {doc.filePath ? (
                          <div className="pr-lead-doc-actions">
                            <a
                              className="pr-doc-btn view"
                              href={`${API_URL}${doc.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye size={13} /> View
                            </a>
                            <button
                              type="button"
                              className="pr-doc-btn download"
                              onClick={() => handlePrDocDownload(doc)}
                            >
                              <Download size={13} /> Download
                            </button>
                          </div>
                        ) : (
                          <small>No file</small>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedPrLead.adminNotes && (
                <div className="admin-modal-section" style={{ marginTop: 16 }}>
                  <h4>Admin Notes</h4>
                  <p className="pr-lead-notes-block">{selectedPrLead.adminNotes}</p>
                </div>
              )}

              <div className="pr-lead-view-actions">
                <button type="button" className="followup-cancel-btn" onClick={closePrLeadModal}>Close</button>
                <button type="button" className="admin-action-btn" style={{ background: '#f59e0b', color: '#fff', border: 'none' }} onClick={() => setPrModalMode('edit')}>
                  <Edit size={14} /> Edit
                </button>
                <button type="button" className="admin-action-btn" style={{ background: '#2563eb', color: '#fff', border: 'none' }} onClick={() => setPrModalMode('mail')}>
                  <Mail size={14} /> Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPrLead && prModalMode === 'edit' && prEditData && (
        <div className="admin-modal-overlay">
          <div className="admin-modal edit-profile-modal">
            <div className="admin-modal-header">
              <div>
                <h3>Edit Australia PR Lead</h3>
                <p className="pr-lead-modal-subtitle">Update candidate details and follow-up status</p>
              </div>
              <button className="admin-modal-close" onClick={closePrLeadModal}>✕</button>
            </div>
            <form onSubmit={handleUpdatePrLead}>
              <div className="admin-modal-body">
                <div className="edit-profile-grid">
                  <div className="edit-profile-field">
                    <label>Full name</label>
                    <input
                      value={prEditData.name}
                      onChange={(e) => setPrEditData({ ...prEditData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label>Phone / WhatsApp</label>
                    <input
                      value={prEditData.phone}
                      onChange={(e) => setPrEditData({ ...prEditData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={prEditData.email}
                      onChange={(e) => setPrEditData({ ...prEditData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label>Status</label>
                    <CustomSelect
                      id="pr-edit-status"
                      className="admin-portal-select admin-portal-select-full"
                      value={prEditData.status}
                      onChange={(e) => setPrEditData({ ...prEditData, status: e.target.value })}
                      options={[
                        { value: 'New', label: 'New' },
                        { value: 'Contacted', label: 'Contacted' },
                        { value: 'Converted', label: 'Converted' },
                        { value: 'Closed', label: 'Closed' },
                      ]}
                    />
                  </div>
                  <div className="edit-profile-field edit-profile-field-full">
                    <label>Occupation</label>
                    <input
                      value={prEditData.occupation}
                      onChange={(e) => setPrEditData({ ...prEditData, occupation: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label>ANZSCO</label>
                    <input
                      value={prEditData.anzsco}
                      onChange={(e) => setPrEditData({ ...prEditData, anzsco: e.target.value })}
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label>Assessing body</label>
                    <input
                      value={prEditData.assessingBody}
                      onChange={(e) => setPrEditData({ ...prEditData, assessingBody: e.target.value })}
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label>Origin</label>
                    <CustomSelect
                      id="pr-edit-origin"
                      className="admin-portal-select admin-portal-select-full"
                      value={prEditData.origin || ''}
                      onChange={(e) => setPrEditData({ ...prEditData, origin: e.target.value })}
                      options={[
                        { value: '', label: 'Not set' },
                        { value: 'offshore', label: 'Offshore' },
                        { value: 'onshore', label: 'Onshore' },
                      ]}
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label>Country</label>
                    <input
                      value={prEditData.country}
                      onChange={(e) => setPrEditData({ ...prEditData, country: e.target.value })}
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label>State (AU)</label>
                    <input
                      value={prEditData.state}
                      onChange={(e) => setPrEditData({ ...prEditData, state: e.target.value })}
                    />
                  </div>
                  <div className="edit-profile-field edit-profile-field-full">
                    <label>Experience / training notes</label>
                    <textarea
                      className="followup-textarea"
                      value={prEditData.existingExperience}
                      onChange={(e) => setPrEditData({ ...prEditData, existingExperience: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="edit-profile-field edit-profile-field-full">
                    <label>Admin notes</label>
                    <textarea
                      className="followup-textarea"
                      value={prEditData.adminNotes}
                      onChange={(e) => setPrEditData({ ...prEditData, adminNotes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="edit-profile-footer">
                <button type="button" className="followup-cancel-btn" onClick={() => setPrModalMode('view')}>Cancel</button>
                <button type="submit" className="followup-send-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPrLead && prModalMode === 'mail' && (
        <div className="admin-modal-overlay">
          <div className="admin-modal followup-modal">
            <div className="admin-modal-header">
              <div>
                <h3>Send Australia PR Follow-Up</h3>
                <p className="followup-modal-subtitle">
                  Notes and files will be emailed to {selectedPrLead.email}
                </p>
              </div>
              <button className="admin-modal-close" onClick={closePrLeadModal}>✕</button>
            </div>
            <form onSubmit={handleSendPrMail}>
              <div className="admin-modal-body">
                <div className="followup-section">
                  <label className="followup-label">
                    <FileText size={16} />
                    Follow-Up Notes
                  </label>
                  <textarea
                    className="followup-textarea"
                    placeholder="Write the PR guidance, document checklist notes, and next steps for the candidate..."
                    value={prMailMessage}
                    onChange={(e) => setPrMailMessage(e.target.value)}
                  />
                </div>

                <div className="followup-section">
                  <label className="followup-label">
                    <UploadCloud size={16} />
                    Upload Files
                  </label>
                  <label className="followup-upload-zone">
                    <UploadCloud size={28} />
                    <span className="followup-upload-title">Click to upload multiple files</span>
                    <span className="followup-upload-hint">PDF, DOC, DOCX — up to 10 files</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const selected = Array.from(e.target.files || []);
                        setPrMailFiles((prev) => [...prev, ...selected].slice(0, 10));
                        e.target.value = '';
                      }}
                    />
                  </label>

                  {prMailFiles.length > 0 && (
                    <div className="followup-file-list">
                      {prMailFiles.map((file, index) => (
                        <div className="followup-file-item" key={`${file.name}-${index}`}>
                          <div className="followup-file-info">
                            <FileText size={16} />
                            <span>{file.name}</span>
                            <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                          </div>
                          <button
                            type="button"
                            className="followup-file-remove"
                            onClick={() => setPrMailFiles((prev) => prev.filter((_, i) => i !== index))}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="followup-modal-footer">
                <button type="button" className="followup-cancel-btn" onClick={closePrLeadModal}>Cancel</button>
                <button type="submit" className="followup-send-btn" disabled={prMailSending}>
                  {prMailSending ? 'Sending...' : 'Send to Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (BOOKING REVIEW) */}
      {selectedBooking && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Candidate Detail Review</h3>
              <button className="admin-modal-close" onClick={() => setSelectedBooking(null)}>✕</button>
            </div>
            
            <div className="admin-modal-body">
              <div className="admin-modal-grid">
                
                {/* Personal Info */}
                <div className="admin-modal-section">
                  <h4><Users size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Candidate Profile</h4>
                  <div className="detail-item"><span className="detail-label">Full Name:</span><span className="detail-val">{selectedBooking.name}</span></div>
                  <div className="detail-item"><span className="detail-label">WhatsApp:</span><span className="detail-val">{selectedBooking.phone}</span></div>
                  <div className="detail-item"><span className="detail-label">Email:</span><span className="detail-val">{selectedBooking.email}</span></div>
                  <div className="detail-item"><span className="detail-label">Age:</span><span className="detail-val">{selectedBooking.age} years old</span></div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {selectedBooking.address}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Highest Education:</span>
                    <span className="detail-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GraduationCap size={12} /> {selectedBooking.education}
                    </span>
                  </div>
                  <div className="detail-item"><span className="detail-label">Current Status:</span><span className="detail-val">{selectedBooking.currentStatus}</span></div>
                  <div className="detail-item"><span className="detail-label">Special Skills/Trade:</span><span className="detail-val">{selectedBooking.skills || 'None listed'}</span></div>
                </div>

                {/* Service Details */}
                <div className="admin-modal-section">
                  <h4><Briefcase size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Service Specifications</h4>
                  
                  {/* Career Details */}
                  {selectedBooking.services.includes('career') && (
                    <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '700', color: '#16a34a', fontSize: '12.5px', marginBottom: '6px' }}>Career Mapping Details:</div>
                      <div className="detail-item"><span className="detail-label">Industry:</span><span className="detail-val">{selectedBooking.careerDetails?.industry || 'N/A'}</span></div>
                      <div className="detail-item"><span className="detail-label">Role:</span><span className="detail-val">{selectedBooking.careerDetails?.position || 'N/A'}</span></div>
                    </div>
                  )}

                  {/* Visa Details */}
                  {selectedBooking.services.includes('visa') && (
                    <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '700', color: '#2563eb', fontSize: '12.5px', marginBottom: '6px' }}>Visa & Migration Details:</div>
                      <div className="detail-item"><span className="detail-label">Preferred Country:</span><span className="detail-val">{selectedBooking.migrationDetails?.preferredCountry || 'N/A'}</span></div>
                      <div className="detail-item"><span className="detail-label">Passport status:</span><span className="detail-val">{selectedBooking.migrationDetails?.passportStatus || 'N/A'}</span></div>
                      <div className="detail-item"><span className="detail-label">Overseas Experience:</span><span className="detail-val">{selectedBooking.migrationDetails?.overseasExperience || 'N/A'}</span></div>
                    </div>
                  )}

                  {/* Job Placement Details */}
                  {selectedBooking.services.includes('placement') && (
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '700', color: '#9333ea', fontSize: '12.5px', marginBottom: '6px' }}>Job Placement Details:</div>
                      <div className="detail-item"><span className="detail-label">Preferred Field:</span><span className="detail-val">{selectedBooking.placementDetails?.preferredIndustry || 'N/A'}</span></div>
                      {selectedBooking.placementDetails?.cvPath ? (
                        <div className="detail-item" style={{ marginTop: '6px' }}>
                          <a 
                            href={`${API_URL}${selectedBooking.placementDetails.cvPath}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="cv-download-link"
                          >
                            <Download size={14} /> Download CV Resume
                          </a>
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>No CV document uploaded</div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: '14px' }} className="detail-item">
                    <span className="detail-label">Candidate Notes / Queries:</span>
                    <p style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px', color: '#0f172a', marginTop: '6px' }}>
                      {selectedBooking.notes || 'No custom query entered'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Log / Counselor Notes */}
              <form className="counselor-notes-form" onSubmit={handleUpdateBooking}>
                <h4>Counselor Notes & Actions</h4>
                
                <textarea 
                  placeholder="Record summary of 45-min consultation, recommendations, next actions..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                />

                <div className="counselor-form-actions">
                  <div className="counselor-status-row">
                    <span className="counselor-status-label">Booking Status:</span>
                    <CustomSelect
                      id="modal-status"
                      className="admin-portal-select admin-portal-select-inline"
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      options={BOOKING_STATUS_OPTIONS}
                    />
                  </div>

                  <button type="submit" className="save-counselor-btn">
                    Save Logs & Status
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* CRUD MODAL: SERVICE (CREATE / EDIT) */}
      {isServiceModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h3>{editingService ? 'Edit Advisory Service' : 'Add New Advisory Service'}</h3>
              <button className="admin-modal-close" onClick={() => setIsServiceModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSaveService}>
              <div className="admin-modal-body">
                <div className="admin-form-grid" style={{ gap: '20px' }}>
                  <div className="admin-input-group">
                    <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Service Title</label>
                    <div className="admin-input-wrapper" style={{ display: 'block' }}>
                      <input 
                        type="text" 
                        placeholder="e.g. Flight Training Guide" 
                        value={serviceTitle} 
                        onChange={(e) => setServiceTitle(e.target.value)}
                        required
                        style={{ width: '100%', height: '42px', paddingLeft: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="admin-input-group">
                    <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Unique Key / Slug (lowercase)</label>
                    <div className="admin-input-wrapper" style={{ display: 'block' }}>
                      <input 
                        type="text" 
                        placeholder="e.g. flight" 
                        value={serviceKey} 
                        onChange={(e) => setServiceKey(e.target.value)}
                        required
                        disabled={!!editingService}
                        style={{ width: '100%', height: '42px', paddingLeft: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#0f172a', outline: 'none', opacity: editingService ? 0.7 : 1 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-form-grid" style={{ gap: '20px', marginTop: '20px' }}>
                  <div className="admin-input-group">
                    <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Session Price (INR)</label>
                    <div className="admin-input-wrapper" style={{ display: 'block' }}>
                      <input 
                        type="number" 
                        placeholder="e.g. 250" 
                        value={servicePrice} 
                        onChange={(e) => setServicePrice(e.target.value)}
                        required
                        style={{ width: '100%', height: '42px', paddingLeft: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="admin-input-group">
                    <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Service Icon</label>
                    <div className="admin-input-wrapper" style={{ display: 'block', position: 'relative' }}>
                      <div 
                        onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                        style={{
                          width: '100%', 
                          height: '42px', 
                          paddingLeft: '16px', 
                          border: '1px solid #cbd5e1', 
                          borderRadius: '8px', 
                          background: '#f8fafc', 
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {serviceIcon ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {IconMap[serviceIcon] && React.createElement(IconMap[serviceIcon], { size: 16 })}
                            {serviceIcon}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Select an icon...</span>
                        )}
                        <span style={{ marginRight: '16px', fontSize: '10px' }}>▼</span>
                      </div>
                      
                      {isIconDropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '4px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          maxHeight: '180px',
                          overflowY: 'auto',
                          zIndex: 50
                        }}>
                          {Object.keys(IconMap).map(iconName => (
                            <div 
                              key={iconName} 
                              onClick={() => {
                                setServiceIcon(iconName);
                                setIsIconDropdownOpen(false);
                              }}
                              style={{
                                padding: '10px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                fontSize: '13px',
                                color: '#0f172a'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              {React.createElement(IconMap[iconName], { size: 16 })}
                              <span>{iconName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: '20px' }}>
                  <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px' }}>Service Description</label>
                  <textarea 
                    placeholder="Describe what the candidate gets in this service..."
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      minHeight: '100px', 
                      background: '#ffffff', 
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <div className="admin-modal-header" style={{ borderTop: '1px solid #f1f5f9', borderBottom: 'none', justifyContent: 'flex-end', gap: '10px', padding: '16px 30px' }}>
                <button type="button" className="admin-action-btn" style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }} onClick={() => setIsServiceModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-action-btn">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD MODAL: VISA PATHWAY (CREATE / EDIT) */}
      {isPathwayModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal pathway-form-modal">
            <div className="admin-modal-header">
              <div>
                <h3>{editingPathway ? 'Edit Visa Pathway' : 'Add New Visa Pathway'}</h3>
                <p className="pathway-form-subtitle">Select a country and the flag will be detected automatically</p>
              </div>
              <button className="admin-modal-close" onClick={() => setIsPathwayModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSavePathway}>
              <div className="admin-modal-body pathway-form-body">
                <div className="pathway-form-field" ref={pathwayCountryRef}>
                  <label htmlFor="pathway-country-search">Country Name</label>
                  <div className={`pathway-country-input-wrap ${pathwayCountryFlag ? 'has-flag' : ''}`}>
                    {pathwayCountryFlag && (
                      <img
                        className="pathway-country-input-flag"
                        src={getFlagImageUrl(pathwayCountryName, pathwayCountryFlag, 'w20')}
                        alt={`${pathwayCountryName} flag`}
                      />
                    )}
                    <input
                      id="pathway-country-search"
                      type="text"
                      placeholder="Search and select country"
                      value={pathwayCountrySearch}
                      onChange={(e) => handlePathwayCountryChange(e.target.value)}
                      onFocus={() => setIsPathwayCountryOpen(true)}
                      autoComplete="off"
                      required
                    />
                  </div>

                  {isPathwayCountryOpen && (
                    <div className="pathway-country-dropdown">
                      {getFilteredPathwayCountries().length > 0 ? (
                        getFilteredPathwayCountries().map((country) => (
                          <button
                            key={`${country.code}-${country.name}`}
                            type="button"
                            className={`pathway-country-option ${pathwayCountryFlag === country.code && pathwayCountryName === country.name ? 'active' : ''}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handlePathwayCountrySelect(country)}
                          >
                            <img src={getFlagImageUrl(country.name, country.code, 'w20')} alt={country.name} />
                            <span>{country.name}</span>
                            <small>{country.code.toUpperCase()}</small>
                          </button>
                        ))
                      ) : (
                        <div className="pathway-country-empty">No country found</div>
                      )}
                    </div>
                  )}

                  <div className="pathway-country-quick-list">
                    {POPULAR_PATHWAY_COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        className={`pathway-country-chip ${pathwayCountryFlag === country.code && pathwayCountryName === country.name ? 'active' : ''}`}
                        onClick={() => handlePathwayCountrySelect(country)}
                      >
                        <img src={getFlagImageUrl(country.name, country.code, 'w20')} alt={country.name} />
                        <span>{country.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pathway-form-field">
                  <label htmlFor="pathway-visa-types">Visa Types (comma separated)</label>
                  <input
                    id="pathway-visa-types"
                    type="text"
                    className="pathway-form-input"
                    placeholder="e.g. Opportunity Card, Work Permit"
                    value={pathwayVisaTypes}
                    onChange={(e) => setPathwayVisaTypes(e.target.value)}
                    required
                  />
                </div>

                <div className="pathway-form-field">
                  <label htmlFor="pathway-doc-badge">Document Badge / Hint</label>
                  <input
                    id="pathway-doc-badge"
                    type="text"
                    className="pathway-form-input"
                    placeholder="e.g. Detailed visa document provided"
                    value={pathwayDocBadgeText}
                    onChange={(e) => setPathwayDocBadgeText(e.target.value)}
                    required
                  />
                </div>

                <div className="pathway-form-field">
                  <label htmlFor="pathway-description">Pathway Description</label>
                  <textarea
                    id="pathway-description"
                    className="pathway-form-textarea"
                    placeholder="Describe migration requirements, shortage occupations, language skills..."
                    value={pathwayDescription}
                    onChange={(e) => setPathwayDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pathway-form-footer">
                <button type="button" className="pathway-form-cancel-btn" onClick={() => setIsPathwayModalOpen(false)}>Cancel</button>
                <button type="submit" className="pathway-form-save-btn">Save Pathway</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* SCHEDULE MEETING MODAL */}
      {isScheduleModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header">
              <h3>Schedule Session</h3>
              <button className="admin-modal-close" onClick={() => setIsScheduleModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleScheduleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-input-group">
                  <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px' }}>Meeting Date & Time</label>
                  <div className="admin-input-wrapper" style={{ display: 'block' }}>
                    <input 
                      type="datetime-local" 
                      value={scheduleDateTime} 
                      onChange={(e) => setScheduleDateTime(e.target.value)}
                      required
                      style={{ paddingLeft: '16px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', width: '100%' }}
                    />
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: '20px' }}>
                  <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px' }}>Meeting Link (Google Meet, Zoom)</label>
                  <div className="admin-input-wrapper" style={{ display: 'block' }}>
                    <input 
                      type="url" 
                      placeholder="https://meet.google.com/..." 
                      value={scheduleLink} 
                      onChange={(e) => setScheduleLink(e.target.value)}
                      required
                      style={{ paddingLeft: '16px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-header" style={{ borderTop: '1px solid #f1f5f9', borderBottom: 'none', justifyContent: 'flex-end', gap: '10px', padding: '16px 30px' }}>
                <button type="button" className="admin-action-btn" style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }} onClick={() => setIsScheduleModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-action-btn" disabled={loading}>{loading ? 'Scheduling...' : 'Send Invite'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST MEETING DOC MODAL */}
      {isPostMeetingModalOpen && selectedBooking && (
        <div className="admin-modal-overlay">
          <div className="admin-modal followup-modal">
            <div className="admin-modal-header">
              <div>
                <h3>Send Session Follow-Up</h3>
                <p className="followup-modal-subtitle">
                  Notes and files will be emailed to {selectedBooking.email}
                </p>
              </div>
              <button className="admin-modal-close" onClick={() => setIsPostMeetingModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handlePostMeetingSubmit}>
              <div className="admin-modal-body">
                <div className="followup-section">
                  <label className="followup-label">
                    <FileText size={16} />
                    Session Notes
                  </label>
                  <textarea 
                    className="followup-textarea"
                    placeholder="Write the session summary, recommendations, and next steps for the candidate..."
                    value={postMeetingNotes}
                    onChange={(e) => setPostMeetingNotes(e.target.value)}
                  />
                </div>

                <div className="followup-section">
                  <label className="followup-label">
                    <UploadCloud size={16} />
                    Upload Files
                  </label>
                  <label className="followup-upload-zone">
                    <UploadCloud size={28} />
                    <span className="followup-upload-title">Click to upload multiple files</span>
                    <span className="followup-upload-hint">PDF, DOC, DOCX — up to 10 files, 5MB each</span>
                    <input 
                      type="file"
                      multiple
                      onChange={handlePostMeetingFilesChange}
                      accept=".pdf,.doc,.docx"
                    />
                  </label>

                  {postMeetingFiles.length > 0 && (
                    <div className="followup-file-list">
                      {postMeetingFiles.map((file, index) => (
                        <div className="followup-file-item" key={`${file.name}-${index}`}>
                          <div className="followup-file-info">
                            <FileText size={16} />
                            <span>{file.name}</span>
                            <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                          </div>
                          <button
                            type="button"
                            className="followup-file-remove"
                            onClick={() => removePostMeetingFile(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="followup-modal-footer">
                <button type="button" className="followup-cancel-btn" onClick={() => setIsPostMeetingModalOpen(false)}>Cancel</button>
                <button type="submit" className="followup-send-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send to Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EDIT PROFILE MODAL */}
      {isEditProfileModalOpen && editProfileData && (
        <div className="admin-modal-overlay">
          <div className="admin-modal edit-profile-modal">
            <div className="admin-modal-header">
              <div>
                <h3>Edit Candidate Profile</h3>
                <p className="edit-profile-subtitle">Update candidate contact and background details</p>
              </div>
              <button className="admin-modal-close" onClick={() => setIsEditProfileModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleEditProfileSubmit}>
              <div className="admin-modal-body edit-profile-body">
                <div className="edit-profile-grid">
                  <div className="edit-profile-field">
                    <label htmlFor="edit-name">Full Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      value={editProfileData.name}
                      onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="edit-phone">WhatsApp / Phone</label>
                    <input
                      id="edit-phone"
                      type="text"
                      value={editProfileData.phone}
                      onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="edit-email">Email</label>
                    <input
                      id="edit-email"
                      type="email"
                      value={editProfileData.email}
                      onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="edit-age">Age</label>
                    <input
                      id="edit-age"
                      type="number"
                      value={editProfileData.age}
                      onChange={(e) => setEditProfileData({ ...editProfileData, age: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field edit-profile-field-full">
                    <label htmlFor="edit-address">Location / Address</label>
                    <input
                      id="edit-address"
                      type="text"
                      value={editProfileData.address}
                      onChange={(e) => setEditProfileData({ ...editProfileData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="edit-education">Education</label>
                    <input
                      id="edit-education"
                      type="text"
                      value={editProfileData.education}
                      onChange={(e) => setEditProfileData({ ...editProfileData, education: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="edit-status">Current Status</label>
                    <CustomSelect
                      id="edit-status"
                      className="admin-portal-select admin-portal-select-full"
                      value={editProfileData.currentStatus}
                      onChange={(e) => setEditProfileData({ ...editProfileData, currentStatus: e.target.value })}
                      options={EDIT_STATUS_OPTIONS}
                    />
                  </div>
                  <div className="edit-profile-field edit-profile-field-full">
                    <label htmlFor="edit-skills">Skills / Trade</label>
                    <input
                      id="edit-skills"
                      type="text"
                      value={editProfileData.skills}
                      onChange={(e) => setEditProfileData({ ...editProfileData, skills: e.target.value })}
                      placeholder="e.g. Welding, Electrician, Plumbing..."
                    />
                  </div>
                </div>
              </div>
              <div className="edit-profile-footer">
                <button type="button" className="edit-profile-cancel-btn" onClick={() => setIsEditProfileModalOpen(false)}>Cancel</button>
                <button type="submit" className="edit-profile-save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDY ABROAD STUDENT MODALS */}
      {selectedStudentLead && studentModalMode === 'view' && (
        <div className="admin-modal-overlay">
          <div className="admin-modal student-view-modal">
            <div className="admin-modal-header">
              <div>
                <h3>Student — Study Abroad</h3>
                <p className="pr-lead-modal-subtitle">{selectedStudentLead.country}</p>
              </div>
              <button className="admin-modal-close" onClick={closeStudentLeadModal}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="pr-lead-view-banner">
                <div>
                  <strong>{selectedStudentLead.name}</strong>
                  <span>{selectedStudentLead.applyingCourse}</span>
                </div>
                <span className={`badge ${
                  selectedStudentLead.status === 'New' ? 'status-new'
                    : selectedStudentLead.status === 'Contacted' ? 'status-processing'
                    : selectedStudentLead.status === 'Converted' ? 'status-completed'
                    : 'pay-pending'
                }`}>
                  {selectedStudentLead.status}
                </span>
              </div>

              <div className="admin-modal-grid">
                <div className="admin-modal-section">
                  <h4><Users size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Student</h4>
                  <div className="detail-item"><span className="detail-label">Name</span><span className="detail-val">{selectedStudentLead.name}</span></div>
                  <div className="detail-item"><span className="detail-label">Phone</span><span className="detail-val">{selectedStudentLead.phone}</span></div>
                  <div className="detail-item"><span className="detail-label">Email</span><span className="detail-val">{selectedStudentLead.email}</span></div>
                  <div className="detail-item"><span className="detail-label">Country</span><span className="detail-val">{selectedStudentLead.country}</span></div>
                </div>
                <div className="admin-modal-section">
                  <h4><GraduationCap size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Course</h4>
                  <div className="detail-item"><span className="detail-label">Course</span><span className="detail-val">{selectedStudentLead.applyingCourse}</span></div>
                  <div className="detail-item"><span className="detail-label">University</span><span className="detail-val">{selectedStudentLead.targetUniversity || '—'}</span></div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted</span>
                    <span className="detail-val">{new Date(selectedStudentLead.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedStudentLead.adminNotes && (
                <div className="admin-modal-section student-view-notes">
                  <h4>Admin Notes</h4>
                  <p className="pr-lead-notes-block">{selectedStudentLead.adminNotes}</p>
                </div>
              )}

              <div className="admin-modal-section student-view-docs">
                <h4>Uploaded Documents ({(selectedStudentLead.uploadedDocuments || []).length})</h4>
                {(selectedStudentLead.uploadedDocuments || []).length === 0 ? (
                  <p className="student-reupload-empty">No documents attached</p>
                ) : (
                  <div className="pr-lead-doc-list">
                    {selectedStudentLead.uploadedDocuments.map((doc, idx) => (
                      <div className="pr-lead-doc-item student-view-doc-item" key={`${doc.title}-${idx}`}>
                        <div className="student-view-doc-meta">
                          <span className="student-view-doc-title">{doc.title}</span>
                          {doc.fileName && <small className="student-view-doc-file">{doc.fileName}</small>}
                          {doc.needsReupload && (
                            <span className="student-view-doc-badge">Re-upload requested</span>
                          )}
                        </div>
                        {doc.filePath ? (
                          <div className="pr-lead-doc-actions">
                            <a
                              className="pr-doc-btn view"
                              href={`${API_URL}${doc.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye size={13} /> View
                            </a>
                            <button
                              type="button"
                              className="pr-doc-btn download"
                              onClick={() => handleStudentDocDownload(doc)}
                            >
                              <Download size={13} /> Download
                            </button>
                          </div>
                        ) : (
                          <span className="student-reupload-empty">No file</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="edit-profile-footer">
              <button type="button" className="edit-profile-cancel-btn" onClick={closeStudentLeadModal}>
                Close
              </button>
              <button
                type="button"
                className="edit-profile-save-btn student-reupload-send-btn"
                onClick={() => openStudentLeadModal(selectedStudentLead, 'mail')}
              >
                Request re-upload
              </button>
              <button
                type="button"
                className="edit-profile-save-btn"
                onClick={() => openStudentLeadModal(selectedStudentLead, 'edit')}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedStudentLead && studentModalMode === 'edit' && studentEditData && (
        <div className="admin-modal-overlay">
          <div className="admin-modal edit-profile-modal">
            <div className="admin-modal-header">
              <h3>Edit Student Lead</h3>
              <button className="admin-modal-close" onClick={closeStudentLeadModal}>✕</button>
            </div>
            <form onSubmit={handleUpdateStudentLead}>
              <div className="admin-modal-body">
                <div className="edit-profile-grid">
                  <div className="edit-profile-field">
                    <label htmlFor="student-edit-name">Name</label>
                    <input
                      id="student-edit-name"
                      value={studentEditData.name}
                      onChange={(e) => setStudentEditData({ ...studentEditData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="student-edit-phone">Phone</label>
                    <input
                      id="student-edit-phone"
                      value={studentEditData.phone}
                      onChange={(e) => setStudentEditData({ ...studentEditData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="student-edit-email">Email</label>
                    <input
                      id="student-edit-email"
                      type="email"
                      value={studentEditData.email}
                      onChange={(e) => setStudentEditData({ ...studentEditData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="student-edit-country">Country</label>
                    <input
                      id="student-edit-country"
                      value={studentEditData.country}
                      onChange={(e) => setStudentEditData({ ...studentEditData, country: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="student-edit-course">Course</label>
                    <input
                      id="student-edit-course"
                      value={studentEditData.applyingCourse}
                      onChange={(e) => setStudentEditData({ ...studentEditData, applyingCourse: e.target.value })}
                      required
                    />
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="student-edit-university">University</label>
                    <input
                      id="student-edit-university"
                      value={studentEditData.targetUniversity}
                      onChange={(e) => setStudentEditData({ ...studentEditData, targetUniversity: e.target.value })}
                    />
                  </div>
                  <div className="edit-profile-field edit-profile-field-full">
                    <label htmlFor="student-edit-status">Status</label>
                    <select
                      id="student-edit-status"
                      value={studentEditData.status}
                      onChange={(e) => setStudentEditData({ ...studentEditData, status: e.target.value })}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="edit-profile-field edit-profile-field-full">
                    <label htmlFor="student-edit-notes">Admin Notes</label>
                    <textarea
                      id="student-edit-notes"
                      rows={4}
                      value={studentEditData.adminNotes}
                      onChange={(e) => setStudentEditData({ ...studentEditData, adminNotes: e.target.value })}
                      placeholder="Internal notes for this student..."
                    />
                  </div>
                </div>
              </div>
              <div className="edit-profile-footer">
                <button type="button" className="edit-profile-cancel-btn" onClick={closeStudentLeadModal}>
                  Cancel
                </button>
                <button type="submit" className="edit-profile-save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudentLead && studentModalMode === 'mail' && (
        <div className="admin-modal-overlay">
          <div className="admin-modal student-reupload-modal">
            <div className="admin-modal-header">
              <div>
                <h3>Request document re-upload</h3>
                <p className="pr-lead-modal-subtitle">
                  Email <strong>{selectedStudentLead.email}</strong> a secure link to upload or replace selected documents
                </p>
              </div>
              <button className="admin-modal-close" onClick={closeStudentLeadModal}>✕</button>
            </div>
            <form onSubmit={handleSendStudentReuploadMail}>
              <div className="admin-modal-body">
                <p className="student-reupload-help">
                  Select any document to request — whether the student already uploaded it or not.
                  They will get a link to upload only those files. When they submit, this panel updates automatically.
                </p>

                {(() => {
                  const options = getStudentReuploadDocOptions(selectedStudentLead);
                  if (options.length === 0) {
                    return (
                      <p className="student-reupload-empty">
                        No document checklist found for this country.
                      </p>
                    );
                  }
                  return (
                    <div className="student-reupload-doc-list">
                      {options.map((doc, idx) => {
                        const checked = studentWrongDocs.includes(doc.title);
                        const hasFile = Boolean(doc.filePath);
                        return (
                          <label
                            key={`${doc.title}-${idx}`}
                            className={`student-reupload-doc-item${checked ? ' selected' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleStudentWrongDoc(doc.title)}
                            />
                            <span className="student-reupload-doc-text">
                              <strong>{doc.title}</strong>
                              <small>
                                {hasFile
                                  ? `Uploaded${doc.fileName ? `: ${doc.fileName}` : ''}`
                                  : 'Not uploaded yet'}
                                {doc.needsReupload ? ' · Re-upload already requested' : ''}
                              </small>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  );
                })()}

                <div className="edit-profile-field" style={{ marginTop: 18 }}>
                  <label htmlFor="student-reupload-note">Note to student (optional)</label>
                  <textarea
                    id="student-reupload-note"
                    rows={3}
                    value={studentMailMessage}
                    onChange={(e) => setStudentMailMessage(e.target.value)}
                    placeholder="e.g. Passport scan is blurry — please upload a clear colour PDF of all pages."
                  />
                </div>
              </div>
              <div className="edit-profile-footer">
                <button type="button" className="edit-profile-cancel-btn" onClick={closeStudentLeadModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-profile-save-btn student-reupload-send-btn"
                  disabled={studentMailSending || studentWrongDocs.length === 0}
                >
                  {studentMailSending ? 'Sending...' : `Send link (${studentWrongDocs.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdminSettings && (
        <div className="admin-modal-overlay" onClick={closeAdminSettings}>
          <div
            className="admin-modal edit-profile-modal admin-settings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h3>Account settings</h3>
                <p className="pr-lead-modal-subtitle">
                  Update your profile details or change your password
                </p>
              </div>
              <button type="button" className="admin-modal-close" onClick={closeAdminSettings}>
                ✕
              </button>
            </div>

            <div className="admin-settings-tabs">
              <button
                type="button"
                className={`admin-settings-tab${adminSettingsTab === 'profile' ? ' active' : ''}`}
                onClick={() => setAdminSettingsTab('profile')}
              >
                <User size={16} />
                Profile
              </button>
              <button
                type="button"
                className={`admin-settings-tab${adminSettingsTab === 'password' ? ' active' : ''}`}
                onClick={() => setAdminSettingsTab('password')}
              >
                <Lock size={16} />
                Password
              </button>
            </div>

            {adminSettingsTab === 'profile' ? (
              <form onSubmit={handleSaveAdminProfile}>
                <div className="admin-modal-body">
                  <div className="admin-avatar-upload">
                    <div className="admin-avatar-preview">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" />
                      ) : (
                        <span>
                          {(profileForm.name || profileForm.email || 'A').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="admin-avatar-actions">
                      <label className="admin-avatar-pick-btn">
                        <Camera size={15} />
                        {avatarPreview ? 'Change photo' : 'Upload photo'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleAvatarPick}
                          hidden
                        />
                      </label>
                      {avatarPreview && (
                        <button
                          type="button"
                          className="admin-avatar-remove-btn"
                          onClick={handleRemoveAvatar}
                        >
                          Remove
                        </button>
                      )}
                      <p className="admin-avatar-hint">JPG, PNG, WEBP or GIF · max 5MB</p>
                    </div>
                  </div>
                  <div className="edit-profile-field">
                    <label htmlFor="admin-profile-name">Display name</label>
                    <input
                      id="admin-profile-name"
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="edit-profile-field" style={{ marginTop: 14 }}>
                    <label htmlFor="admin-profile-email">Email address</label>
                    <input
                      id="admin-profile-email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="edit-profile-footer">
                  <button type="button" className="edit-profile-cancel-btn" onClick={closeAdminSettings}>
                    Cancel
                  </button>
                  <button type="submit" className="edit-profile-save-btn" disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save profile'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleChangeAdminPassword}>
                <div className="admin-modal-body">
                  <div className="edit-profile-field">
                    <label htmlFor="admin-current-password">Current password</label>
                    <input
                      id="admin-current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter current password"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="edit-profile-field" style={{ marginTop: 14 }}>
                    <label htmlFor="admin-new-password">New password</label>
                    <input
                      id="admin-new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      placeholder="At least 6 characters"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="edit-profile-field" style={{ marginTop: 14 }}>
                    <label htmlFor="admin-confirm-password">Confirm new password</label>
                    <input
                      id="admin-confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Re-enter new password"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="edit-profile-footer">
                  <button type="button" className="edit-profile-cancel-btn" onClick={closeAdminSettings}>
                    Cancel
                  </button>
                  <button type="submit" className="edit-profile-save-btn" disabled={passwordSaving}>
                    {passwordSaving ? 'Updating...' : 'Change password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
