import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [languageData, setLanguageData] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewRes, langRes, trendingRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getLanguageDistribution(),
        analyticsAPI.getTrending()
      ]);
      
      setOverview(overviewRes.data.stats);
      setLanguageData(langRes.data.distribution);
      setTrending(trendingRes.data.trending);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      cpp: '#00599c',
      java: '#007396',
      c: '#555555',
      go: '#00add8',
      rust: '#ce422b',
      typescript: '#3178c6',
      php: '#777bb4',
      ruby: '#cc342d',
    };
    return colors[lang] || '#666';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container analytics-page">
      <div className="page-header">
        <h1>📊 Platform Analytics</h1>
        <p>Insights and statistics</p>
      </div>

      {/* Overview Stats */}
      <div className="analytics-overview">
        <div className="stat-card-large">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{overview?.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        
        <div className="stat-card-large">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-number">{overview?.totalSnippets || 0}</div>
            <div className="stat-label">Total Snippets</div>
          </div>
        </div>
        
        <div className="stat-card-large">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <div className="stat-number">{overview?.totalViews || 0}</div>
            <div className="stat-label">Total Views</div>
          </div>
        </div>
        
        <div className="stat-card-large">
          <div className="stat-icon">▲</div>
          <div className="stat-content">
            <div className="stat-number">{overview?.totalUpvotes || 0}</div>
            <div className="stat-label">Total Upvotes</div>
          </div>
        </div>
      </div>

      {/* Language Distribution */}
      <div className="analytics-section">
        <h2>Language Distribution</h2>
        <div className="language-chart">
          {languageData.map((lang, index) => {
            const total = languageData.reduce((sum, l) => sum + l.count, 0);
            const percentage = ((lang.count / total) * 100).toFixed(1);
            
            return (
              <div key={index} className="language-bar-item">
                <div className="language-label">
                  <span className="lang-name">{lang._id.toUpperCase()}</span>
                  <span className="lang-count">{lang.count} ({percentage}%)</span>
                </div>
                <div className="language-bar">
                  <div
                    className="language-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getLanguageColor(lang._id)
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Snippets */}
      <div className="analytics-section">
        <h2>🔥 Trending This Week</h2>
        <div className="trending-list">
          {trending.map((snippet, index) => (
            <div key={snippet._id} className="trending-item">
              <div className="trending-rank">#{index + 1}</div>
              <div className="trending-content">
                <h3>{snippet.title}</h3>
                <div className="trending-meta">
                  <span>👤 {snippet.submittedBy?.username}</span>
                  <span>👁️ {snippet.views} views</span>
                  <span>▲ {snippet.upvotes} upvotes</span>
                </div>
              </div>
              <span
                className="language-badge small"
                style={{ backgroundColor: getLanguageColor(snippet.language) }}
              >
                {snippet.language}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;