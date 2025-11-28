import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { showSuccess } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const isActive = (path) => location.pathname === path;
  const isLoggedIn = !!localStorage.getItem('authToken');

  const handleProfileClick = () => {
    navigate('/history');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    showSuccess('Logged out successfully');
    setSideMenuOpen(false);
    window.location.href = '/';
  };

  const handleSideMenuNavigation = (path) => {
    navigate(path);
    setSideMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        {/* FAR LEFT: Hamburger Menu */}
        <button 
          className="navbar-hamburger"
          onClick={() => setSideMenuOpen(!sideMenuOpen)}
          aria-label="Open menu"
          title="Open menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* CENTER: Logo and Links */}
        <div className="navbar-center">
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-icon">🛡️</span>
            <span className="navbar-logo-text">TruthGuard</span>
          </Link>

          <div className="navbar-links">
            <Link 
              to="/" 
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/analyze" 
              className={`navbar-link ${isActive('/analyze') ? 'active' : ''}`}
            >
              Analyze
            </Link>
            <Link 
              to="/challenge" 
              className={`navbar-link ${isActive('/challenge') ? 'active' : ''}`}
            >
              Challenge
            </Link>
            <Link 
              to="/leaderboard" 
              className={`navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
            >
              Leaderboard
            </Link>
            <Link 
              to="/history" 
              className={`navbar-link ${isActive('/history') ? 'active' : ''}`}
            >
              History
            </Link>
          </div>
        </div>

        {/* FAR RIGHT: Theme Toggle + Profile Button */}
        <div className="navbar-actions">
          <button 
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            className="navbar-profile-icon"
            onClick={handleProfileClick}
            aria-label="Profile"
            title="Profile"
          >
            👤
          </button>
        </div>
      </nav>

      {/* Side Menu Overlay */}
      {sideMenuOpen && (
        <motion.div
          className="navbar-menu-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSideMenuOpen(false)}
        />
      )}

      {/* Slide-in Side Menu */}
      <motion.div
        className="navbar-side-menu"
        initial={{ x: '-100%' }}
        animate={{ x: sideMenuOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <button 
          className="navbar-menu-close"
          onClick={() => setSideMenuOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
        <nav className="navbar-side-menu-nav">
          <button 
             onClick={() => handleSideMenuNavigation('/')}
            className="navbar-side-menu-item"
          >
             <span className="navbar-side-menu-icon">🏠</span>
             <span className="navbar-side-menu-text">Home</span>
          </button>
          <button 
             onClick={() => handleSideMenuNavigation('/history')}
            className="navbar-side-menu-item"
          >
             <span className="navbar-side-menu-icon">👤</span>
             <span className="navbar-side-menu-text">Profile</span>
           </button>
            <button 
                 onClick={() => handleSideMenuNavigation('/')}
              className="navbar-side-menu-item"
            >
              <span className="navbar-side-menu-icon">📊</span>
              <span className="navbar-side-menu-text">Dashboard</span>
            </button>
          <button 
            onClick={() => handleSideMenuNavigation('/analyze')}
            className="navbar-side-menu-item"
          >
            <span className="navbar-side-menu-icon">🔍</span>
            <span className="navbar-side-menu-text">Analyze</span>
          </button>
          <button 
            onClick={() => handleSideMenuNavigation('/challenge')}
            className="navbar-side-menu-item"
          >
            <span className="navbar-side-menu-icon">🕹️</span>
            <span className="navbar-side-menu-text">Gaming Section</span>
          </button>
          <button 
            onClick={() => handleSideMenuNavigation('/leaderboard')}
            className="navbar-side-menu-item"
          >
            <span className="navbar-side-menu-icon">🏆</span>
            <span className="navbar-side-menu-text">Leaderboard</span>
          </button>
          <button 
            onClick={() => handleSideMenuNavigation('/history')}
            className="navbar-side-menu-item"
          >
            <span className="navbar-side-menu-icon">🎁</span>
            <span className="navbar-side-menu-text">My Rewards</span>
          </button>
          <button 
            onClick={handleLogout}
            className="navbar-side-menu-item navbar-side-menu-logout"
          >
            <span className="navbar-side-menu-icon">🚪</span>
            <span className="navbar-side-menu-text">Logout</span>
          </button>
        </nav>
      </motion.div>
    </>
  );
};

export default Navbar;


