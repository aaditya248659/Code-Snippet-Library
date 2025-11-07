import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SnippetCard = ({ snippet, onUpvote, isAuthenticated, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCardClick = () => {
    navigate(`/snippet/${snippet._id}`);
  };

  const handleUpvote = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    onUpvote(snippet._id);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!onDelete) return;
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    onDelete(snippet._id);
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
    return colors[lang.toLowerCase()] || '#666';
  };

  return (
    <div className="snippet-card" onClick={handleCardClick}>
      <div className="snippet-header">
        <h3 className="snippet-title">{snippet.title}</h3>
        <span
          className="language-badge"
          style={{ backgroundColor: getLanguageColor(snippet.language) }}
        >
          {snippet.language}
        </span>
      </div>

      <p className="snippet-description">
        {snippet.problemDescription.substring(0, 150)}
        {snippet.problemDescription.length > 150 ? '...' : ''}
      </p>

      <div className="snippet-tags">
        {snippet.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="tag">
            #{tag}
          </span>
        ))}
        {snippet.tags.length > 3 && (
          <span className="tag">+{snippet.tags.length - 3} more</span>
        )}
      </div>

      <div className="snippet-footer">
        <div className="author-info">
          <span className="author">
            👤 {snippet.submittedBy?.username || 'Anonymous'}
          </span>
        </div>

        <button
          onClick={handleUpvote}
          className="upvote-btn"
          title="Upvote this snippet"
        >
          ▲ {snippet.upvotes || 0}
        </button>
        {user && (user._id === (snippet.submittedBy && snippet.submittedBy._id ? snippet.submittedBy._id : snippet.submittedBy)) && (
          <button onClick={handleDelete} className="delete-btn" title="Delete snippet">
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default SnippetCard;