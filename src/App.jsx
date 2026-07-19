import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ApplyAustraliaPR from './components/ApplyAustraliaPR';
import AustraliaPREligibility from './components/AustraliaPREligibility';
import StudyAbroadDocuments from './components/StudyAbroadDocuments';
import StudyAbroadWhyDocuments from './components/StudyAbroadWhyDocuments';
import StudyAbroadGuides from './components/StudyAbroadGuides';
import StudyAbroadReupload from './components/StudyAbroadReupload';
import AustraliaPRReupload from './components/AustraliaPRReupload';
import BallotVisaAwareness from './components/BallotVisaAwareness';

// Custom wrapper to manage admin authentication & session checks
const AdminRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('adminToken'));
    };
    
    // Listen to storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminAvatar');
    localStorage.removeItem('adminRole');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  return isAuthenticated ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('adminToken'));

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    // Hard redirect to clear any residual states and refresh socket links
    window.location.href = '/admin';
  };

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
        {/* Public Landing Page */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              onAdminClick={() => {
                window.location.href = '/admin';
              }} 
            />
          } 
        />
        
        {/* Admin Login */}
        <Route 
          path="/admin/login" 
          element={
            isAdminLoggedIn ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
            )
          } 
        />

        {/* Protected Admin Console */}
        <Route path="/admin" element={<AdminRoute />} />

        {/* Australia PR tools */}
        <Route path="/apply-australia-pr" element={<ApplyAustraliaPR />} />
        <Route path="/australia-pr-eligibility" element={<AustraliaPREligibility />} />
        <Route path="/australia-pr-reupload/:token" element={<AustraliaPRReupload />} />
        <Route path="/ballot-visa-awareness" element={<BallotVisaAwareness />} />

        {/* Study Abroad tools */}
        <Route path="/study-abroad-documents" element={<StudyAbroadDocuments />} />
        <Route path="/study-abroad-why-documents" element={<StudyAbroadWhyDocuments />} />
        <Route path="/study-abroad-guides" element={<StudyAbroadGuides />} />
        <Route path="/study-abroad-reupload/:token" element={<StudyAbroadReupload />} />

        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Router>
    </>
  );
}

export default App;
