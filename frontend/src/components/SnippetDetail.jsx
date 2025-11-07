import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { snippetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SnippetDetail = ({ snippet, onUpvote, isAuthenticated, onUpdate }) => {
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(snippet.comments || []);
  const { user } = useAuth();
  const navigate = useNavigate();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpvote = () => {
    if (!isAuthenticated) {
      toast.error('Please login to upvote snippets');
      return;
    }
    onUpvote(snippet._id);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to favorite snippets');
      return;
    }
    try {
      const response = await snippetsAPI.favoriteSnippet(snippet._id);
      setIsFavorited(response.data.isFavorited);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleExport = () => {
    const extension = {
      javascript: 'js',
      python: 'py',
      cpp: 'cpp',
      java: 'java',
      c: 'c',
      go: 'go',
      rust: 'rs',
      typescript: 'ts',
      php: 'php',
      ruby: 'rb'
    };

    const fileName = `${snippet.title.replace(/\s+/g, '_')}.${extension[snippet.language] || 'txt'}`;
    const blob = new Blob([snippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Snippet downloaded!');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) {
      return;
    }
    try {
      await snippetsAPI.deleteSnippet(snippet._id);
      toast.success('Snippet deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete snippet');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await snippetsAPI.addComment(snippet._id, commentText);
      setComments([...comments, response.data.comment]);
      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await snippetsAPI.deleteComment(snippet._id, commentId);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
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
    return colors[lang.toLowerCase()] || '#666';
  };

  const isOwner = user?._id === snippet.submittedBy?._id;

  return (
    <div className="snippet-detail">
      <div className="snippet-detail-header">
        <div>
          <h1 className="snippet-detail-title">{snippet.title}</h1>
          <span
            className="language-badge large"
            style={{ backgroundColor: getLanguageColor(snippet.language) }}
          >
            {snippet.language}
          </span>
        </div>

        <div className="snippet-actions">
          <button onClick={handleUpvote} className="btn btn-primary upvote-btn-large">
            ▲ Upvote ({snippet.upvotes || 0})
          </button>
          <button 
            onClick={handleFavorite} 
            className={`btn ${isFavorited ? 'btn-primary' : 'btn-outline'}`}
          >
            {isFavorited ? '★ Favorited' : '☆ Favorite'}
          </button>
          <button onClick={copyToClipboard} className="btn btn-outline">
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button onClick={handleExport} className="btn btn-outline">
            ⬇ Export
          </button>
          <button onClick={handleShare} className="btn btn-outline">
            🔗 Share
          </button>
          {isOwner && (
            <>
              <button 
                onClick={() => navigate(`/snippet/${snippet._id}/edit`)} 
                className="btn btn-outline"
              >
                ✏️ Edit
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="snippet-meta">
        <span className="meta-item">
          👤 By: <Link to={`/user/${snippet.submittedBy?.username}`}>
            <strong>{snippet.submittedBy?.username || 'Anonymous'}</strong>
          </Link>
        </span>
        {snippet.submittedBy?.githubProfile && (
          <span className="meta-item">
            🔗 <a href={snippet.submittedBy.githubProfile} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </span>
        )}
        <span className="meta-item">
          📅 {new Date(snippet.createdAt).toLocaleDateString()}
        </span>
        <span className="meta-item">
          👁️ {snippet.views || 0} views
        </span>
      </div>

      <div className="problem-section">
        <h2>Problem Description</h2>
        <p className="problem-description">{snippet.problemDescription}</p>
      </div>

      <div className="tags-section">
        <h3>Tags:</h3>
        <div className="snippet-tags">
          {snippet.tags.map((tag, index) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="code-section">
        <h2>Code Solution</h2>
        <div className="code-container">
          <SyntaxHighlighter
            language={snippet.language}
            style={vscDarkPlus}
            showLineNumbers={true}
            wrapLines={true}
            customStyle={{
              borderRadius: '8px',
              padding: '20px',
              fontSize: '14px',
            }}
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2>Comments ({comments.length})</h2>
        
        {isAuthenticated && (
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              maxLength={500}
            />
            <button type="submit" className="btn btn-primary">
              Post Comment
            </button>
          </form>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                <div className="comment-header">
                  <Link to={`/user/${comment.user?.username}`} className="comment-author">
                    {comment.user?.username || 'Anonymous'}
                  </Link>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  {(user?._id === comment.user?._id || user?.role === 'admin') && (
                    <button 
                      onClick={() => handleDeleteComment(comment._id)}
                      className="delete-comment-btn"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail;