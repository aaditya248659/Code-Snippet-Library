import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gamificationAPI } from '../services/api';
import { toast } from 'react-toastify';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await gamificationAPI.getLeaderboard({ timeframe, limit: 50 });
      setLeaderboard(response && response.data && response.data.leaderboard ? response.data.leaderboard : []);
    } catch (error) {
      toast.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="container leaderboard-page">
      <div className="page-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top contributors in the community</p>
      </div>

      <div className="leaderboard-filters">
        <button
          className={`filter-btn ${timeframe === 'all' ? 'active' : ''}`}
          onClick={() => setTimeframe('all')}
        >
          All Time
        </button>
        <button
          className={`filter-btn ${timeframe === 'month' ? 'active' : ''}`}
          onClick={() => setTimeframe('month')}
        >
          This Month
        </button>
        <button
          className={`filter-btn ${timeframe === 'week' ? 'active' : ''}`}
          onClick={() => setTimeframe('week')}
        >
          This Week
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : (
        <div className="leaderboard-container">
          {leaderboard.map((user, index) => {
            const safeUser = user || {};
            const badges = Array.isArray(safeUser.badges) ? safeUser.badges : [];
            const stats = safeUser.stats || { totalSnippets: 0, totalUpvotes: 0 };
            const username = safeUser.username || 'unknown';
            return (
            <div key={safeUser._id || index} className={`leaderboard-item rank-${index + 1}`}>
              <div className="rank-badge">
                <span className="rank-number">{getRankEmoji(index)}</span>
              </div>
              
              <div className="user-avatar">
                <span className="avatar-text">{username.charAt(0).toUpperCase()}</span>
              </div>
              
              <div className="user-info">
                <Link to={`/user/${username}`} className="username-link">
                  {username}
                </Link>
                <div className="user-level">Level {safeUser.level || 0}</div>
              </div>
              
              <div className="user-badges">
                {badges.slice(0, 3).map((badge, idx) => (
                  <span key={idx} className="badge-icon" title={badge && badge.description}>
                    {badge && badge.icon}
                  </span>
                ))}
                {badges.length > 3 && (
                  <span className="badge-more">+{badges.length - 3}</span>
                )}
              </div>
              
              <div className="user-stats-mini">
                <div className="stat-mini">
                  <span className="stat-value">{stats.totalSnippets}</span>
                  <span className="stat-label">Snippets</span>
                </div>
                <div className="stat-mini">
                  <span className="stat-value">{stats.totalUpvotes}</span>
                  <span className="stat-label">Upvotes</span>
                </div>
              </div>
              
              <div className="points-display">
                <span className="points-value">{safeUser.points || 0}</span>
                <span className="points-label">points</span>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;