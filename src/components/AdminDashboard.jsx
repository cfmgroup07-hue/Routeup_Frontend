import React, { useState, useEffect } from 'react';
import { API_URL, SOCKET_URL } from '../config';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { 
  Users, DollarSign, Clock, CheckCircle, Search, 
  Filter, LogOut, ArrowRight, Download, Calendar, 
  MapPin, GraduationCap, Briefcase, FileText, Bell,
  Plus, Edit, Trash2, Globe, FileCheck, Eye, Video, UploadCloud,
  Target, Award, Plane, BookOpen, Compass, ChevronLeft, ChevronRight
} from 'lucide-react';
import { CountryList } from '../utils/countries';

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

  // Active Tab: 'enquiries', 'payments', 'services', 'visa-pathways'
  const [activeTab, setActiveTab] = useState('enquiries');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  // Fetch Bookings
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [isFlagDropdownOpen, setIsFlagDropdownOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleLink, setScheduleLink] = useState('');
  const [scheduleDateTime, setScheduleDateTime] = useState('');

  const [isPostMeetingModalOpen, setIsPostMeetingModalOpen] = useState(false);
  const [postMeetingNotes, setPostMeetingNotes] = useState('');
  const [postMeetingDoc, setPostMeetingDoc] = useState(null);

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
    setPostMeetingDoc(null);
    setIsPostMeetingModalOpen(true);
  };

  const handlePostMeetingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('notes', postMeetingNotes);
    if (postMeetingDoc) {
      formData.append('document', postMeetingDoc);
    }

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
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
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
    setPathwayCountryFlag('ae');
    setPathwayVisaTypes('');
    setPathwayDescription('');
    setPathwayDocBadgeText('Detailed visa document provided');
    setIsFlagDropdownOpen(false);
    setIsPathwayModalOpen(true);
  };

  const openPathwayEditModal = (pathway) => {
    setEditingPathway(pathway);
    setPathwayCountryName(pathway.countryName);
    setPathwayCountryFlag(pathway.countryFlag);
    setPathwayVisaTypes(pathway.visaTypes.join(', '));
    setPathwayDescription(pathway.description);
    setPathwayDocBadgeText(pathway.docBadgeText);
    setIsFlagDropdownOpen(false);
    setIsPathwayModalOpen(true);
  };

  const handleSavePathway = async (e) => {
    e.preventDefault();
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
          countryFlag: pathwayCountryFlag,
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
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-user-avatar">A</div>
            <span>{localStorage.getItem('adminEmail') || 'Admin'}</span>
          </div>
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
          </h2>
        </header>

        {/* LIVE SOCKET TOAST NOTIFICATION */}
        {socketNotification && (
          <div className="socket-notification">
            <Bell className="socket-notification-icon" size={24} />
            <div className="socket-notification-body">
              <h5>{socketNotification.title}</h5>
              <p>{socketNotification.message}</p>
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
                  <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                    <option value="">All Services</option>
                    {servicesList.map(s => (
                      <option key={s._id} value={s.key}>{s.title}</option>
                    ))}
                  </select>

                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Call Status</option>
                    <option value="New">New</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                    <option value="">All Payments</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
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
                              
                              {booking.status !== 'Completed' && (
                                <>
                                  <button className="admin-action-btn icon-only schedule-btn" title="Schedule Meeting" onClick={() => openScheduleModal(booking)} style={{ padding: '6px', background: '#3b82f6', color: '#fff', border: 'none' }}>
                                    <Video size={16} />
                                  </button>

                                  {booking.meetingDetails?.dateTime && new Date(booking.meetingDetails.dateTime) < new Date() && (
                                    <button className="admin-action-btn icon-only upload-btn" title="Upload Notes & Document" onClick={() => openPostMeetingModal(booking)} style={{ padding: '6px', background: '#8b5cf6', color: '#fff', border: 'none' }}>
                                      <UploadCloud size={16} />
                                    </button>
                                  )}

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
                              src={`https://flagcdn.com/w40/${pathway.countryFlag ? pathway.countryFlag.toLowerCase() : 'xx'}.png`} 
                              alt="flag" 
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
        </main>
      </div>

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Booking Status:</span>
                    <select value={modalStatus} onChange={(e) => setModalStatus(e.target.value)}>
                      <option value="New">New</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                    </select>
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
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h3>{editingPathway ? 'Edit Visa Pathway' : 'Add New Visa Pathway'}</h3>
              <button className="admin-modal-close" onClick={() => setIsPathwayModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSavePathway}>
              <div className="admin-modal-body">
                <div className="admin-form-grid" style={{ gap: '20px' }}>
                  <div className="admin-input-group">
                    <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Country Name</label>
                    <div className="admin-input-wrapper" style={{ display: 'block' }}>
                      <input 
                        type="text" 
                        placeholder="e.g. Germany" 
                        value={pathwayCountryName} 
                        onChange={(e) => setPathwayCountryName(e.target.value)}
                        required
                        style={{ width: '100%', height: '42px', paddingLeft: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="admin-input-group">
                    <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Country Flag</label>
                    <div className="admin-input-wrapper" style={{ display: 'block', position: 'relative' }}>
                      <div 
                        onClick={() => setIsFlagDropdownOpen(!isFlagDropdownOpen)}
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
                        {pathwayCountryFlag ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={`https://flagcdn.com/w20/${pathwayCountryFlag.toLowerCase()}.png`} alt="flag" style={{ width: '20px', borderRadius: '2px', border: '1px solid #e2e8f0' }} onError={(e) => e.target.style.display='none'} />
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{pathwayCountryFlag.toUpperCase()}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Select flag...</span>
                        )}
                        <span style={{ marginRight: '16px', fontSize: '10px' }}>▼</span>
                      </div>
                      
                      {isFlagDropdownOpen && (
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
                          maxHeight: '220px',
                          overflowY: 'auto',
                          zIndex: 50
                        }}>
                          {CountryList.map(country => (
                            <div 
                              key={country.code} 
                              onClick={() => {
                                setPathwayCountryFlag(country.code);
                                setIsFlagDropdownOpen(false);
                              }}
                              style={{
                                padding: '10px 16px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <img src={`https://flagcdn.com/w20/${country.code}.png`} alt={country.name} style={{ width: '24px', borderRadius: '2px', border: '1px solid #e2e8f0' }} />
                              <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 'bold' }}>{country.name}</span>
                              <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto', fontWeight: 'bold' }}>{country.code.toUpperCase()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: '20px' }}>
                  <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Visa Types (comma separated)</label>
                  <div className="admin-input-wrapper" style={{ display: 'block' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Opportunity Card, Work Permit" 
                      value={pathwayVisaTypes} 
                      onChange={(e) => setPathwayVisaTypes(e.target.value)}
                      required
                      style={{ width: '100%', height: '42px', paddingLeft: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: '20px' }}>
                  <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Document Badge / Hint</label>
                  <div className="admin-input-wrapper" style={{ display: 'block' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Detailed visa document provided" 
                      value={pathwayDocBadgeText} 
                      onChange={(e) => setPathwayDocBadgeText(e.target.value)}
                      required
                      style={{ width: '100%', height: '42px', paddingLeft: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: '20px' }}>
                  <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px' }}>Pathway Description</label>
                  <textarea 
                    placeholder="Describe migration requirements, shortage occupations, language skills..."
                    value={pathwayDescription}
                    onChange={(e) => setPathwayDescription(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      minHeight: '120px', 
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
                <button type="button" className="admin-action-btn" style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }} onClick={() => setIsPathwayModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-action-btn">Save Pathway</button>
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
      {isPostMeetingModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h3>Post-Session Follow-Up</h3>
              <button className="admin-modal-close" onClick={() => setIsPostMeetingModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handlePostMeetingSubmit}>
              <div className="admin-modal-body">
                <div className="admin-input-group">
                  <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px' }}>Session Notes Summary</label>
                  <textarea 
                    placeholder="Enter summary to send to candidate..."
                    value={postMeetingNotes}
                    onChange={(e) => setPostMeetingNotes(e.target.value)}
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

                <div className="admin-input-group" style={{ marginTop: '20px' }}>
                  <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '13px' }}>Upload Document (Optional)</label>
                  <div className="admin-input-wrapper" style={{ display: 'block', padding: '10px 0' }}>
                    <input 
                      type="file" 
                      onChange={(e) => setPostMeetingDoc(e.target.files[0])}
                      accept=".pdf,.doc,.docx"
                      style={{ color: '#0f172a', width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-header" style={{ borderTop: '1px solid #f1f5f9', borderBottom: 'none', justifyContent: 'flex-end', gap: '10px', padding: '16px 30px' }}>
                <button type="button" className="admin-action-btn" style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }} onClick={() => setIsPostMeetingModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-action-btn" disabled={loading}>{loading ? 'Sending...' : 'Send Notes & Doc'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EDIT PROFILE MODAL */}
      {isEditProfileModalOpen && editProfileData && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Edit Candidate Profile</h3>
              <button className="admin-modal-close" onClick={() => setIsEditProfileModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleEditProfileSubmit}>
              <div className="admin-modal-body">
                <div className="admin-input-group">
                  <label>Full Name</label>
                  <input type="text" value={editProfileData.name} onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div className="admin-input-group" style={{ marginTop: '12px' }}>
                  <label>WhatsApp / Phone</label>
                  <input type="text" value={editProfileData.phone} onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div className="admin-input-group" style={{ marginTop: '12px' }}>
                  <label>Email</label>
                  <input type="email" value={editProfileData.email} onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div className="admin-input-group" style={{ marginTop: '12px' }}>
                  <label>Age</label>
                  <input type="number" value={editProfileData.age} onChange={(e) => setEditProfileData({...editProfileData, age: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div className="admin-input-group" style={{ marginTop: '12px' }}>
                  <label>Location / Address</label>
                  <input type="text" value={editProfileData.address} onChange={(e) => setEditProfileData({...editProfileData, address: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div className="admin-input-group" style={{ marginTop: '12px' }}>
                  <label>Education</label>
                  <input type="text" value={editProfileData.education} onChange={(e) => setEditProfileData({...editProfileData, education: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div className="admin-input-group" style={{ marginTop: '12px' }}>
                  <label>Current Status</label>
                  <select value={editProfileData.currentStatus} onChange={(e) => setEditProfileData({...editProfileData, currentStatus: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Student">Student</option>
                    <option value="Business Owner">Business Owner</option>
                  </select>
                </div>
                <div className="admin-input-group" style={{ marginTop: '12px' }}>
                  <label>Skills / Trade</label>
                  <input type="text" value={editProfileData.skills} onChange={(e) => setEditProfileData({...editProfileData, skills: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn" style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }} onClick={() => setIsEditProfileModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-action-btn" style={{ background: '#0d7c3d', color: '#fff', border: 'none' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
