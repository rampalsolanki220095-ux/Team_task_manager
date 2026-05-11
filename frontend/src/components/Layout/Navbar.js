import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          Task Manager
        </div>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/tasks">Tasks</Link>
          <span>Welcome, {user?.name}</span>
          <span className="status-badge" style={{ background: user?.role === 'Admin' ? '#10b981' : '#667eea' }}>
            {user?.role}
          </span>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;