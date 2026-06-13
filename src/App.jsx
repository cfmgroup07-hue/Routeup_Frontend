import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

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

        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Router>
    </>
  );
}

export default App;
