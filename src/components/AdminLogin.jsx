import React, { useState } from 'react';
import { Mail, Lock, ShieldAlert, LogIn } from 'lucide-react';
import { API_URL } from '../config';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store credentials in localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminEmail', data.email);
      localStorage.setItem('adminName', data.name || 'Admin');
      localStorage.setItem('adminRole', data.role || 'admin');
      if (data.avatar) localStorage.setItem('adminAvatar', data.avatar);
      else localStorage.removeItem('adminAvatar');
      
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img src="/Routeup Logo.png" alt="RouteUp Logo" style={{ height: '48px', objectFit: 'contain' }} />
          </div>
          <h2>Admin Control Panel</h2>
          <p>Sign in to manage candidate counseling sessions</p>
        </div>

        {error && (
          <div className="admin-login-error">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label htmlFor="email">Email Address</label>
            <div className="admin-input-wrapper">
              <Mail className="admin-input-icon" size={18} />
              <input
                type="email"
                id="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label htmlFor="password">Password</label>
            <div className="admin-input-wrapper">
              <Lock className="admin-input-icon" size={18} />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
