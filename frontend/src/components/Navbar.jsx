import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <span className="logo-icon">{'</>'}</span>
          <span className="logo-text">CS-Library</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/code-editor" className="nav-link">💻 Code Editor</Link>
          <Link to="/leaderboard" className="nav-link">🏆 Leaderboard</Link>
          <Link to="/analytics" className="nav-link">📊 Analytics</Link>
          
          {user ? (
            <>
              <Link to="/submit" className="nav-link">Submit Snippet</Link>
              <Link to="/favorites" className="nav-link">⭐ Favorites</Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link admin-link">Admin Dashboard</Link>
              )}
              <div className="user-info">
                <Link to={`/user/${user.username}`} className="username">
                  <span className="user-level">Lv.{user.level || 1}</span>
                  👤 {user.username}
                </Link>
                <button onClick={handleLogout} className="btn btn-outline">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;