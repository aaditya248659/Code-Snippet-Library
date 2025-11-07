import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { snippetsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AdminDashboard = () => {
  const [pendingSnippets, setPendingSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSnippet, setSelectedSnippet] = useState(null);

  useEffect(() => {
    fetchPendingSnippets();
  }, []);

  const fetchPendingSnippets = async () => {
    setLoading(true);
    try {
      const response = await snippetsAPI.getPendingSnippets();
      // API may return { snippets: [...] } or the array directly — be defensive
      const data = response?.data;
      setPendingSnippets(Array.isArray(data) ? data : (data?.snippets ?? []));
    } catch (error) {
      toast.error('Failed to fetch pending snippets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (snippetId) => {
    try {
      await snippetsAPI.approveSnippet(snippetId);
      toast.success('Snippet approved successfully!');
      setPendingSnippets(pendingSnippets.filter(s => s._id !== snippetId));
      setSelectedSnippet(null);
    } catch (error) {
      toast.error('Failed to approve snippet');
      console.error(error);
    }
  };

  const handleDelete = async (snippetId) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      // Admin should call the admin delete endpoint (not the user delete route)
      await snippetsAPI.deleteSnippetAdmin(snippetId);
      toast.success('Snippet deleted successfully!');
      setPendingSnippets(pendingSnippets.filter(s => s._id !== snippetId));
      setSelectedSnippet(null);
    } catch (error) {
      toast.error('Failed to delete snippet');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading pending snippets...</p>
      </div>
    );
  }

  return (
    <div className="container admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>
      <p className="admin-subtitle">Review and approve pending snippets</p>

      {pendingSnippets.length === 0 ? (
        <div className="no-results">
          <h2>No pending snippets</h2>
          <p>All submissions have been reviewed!</p>
        </div>
      ) : (
        <div className="admin-content">
          <div className="snippets-list">
            <h2>Pending Snippets ({pendingSnippets.length})</h2>
            {pendingSnippets.map((snippet) => (
              <div
                key={snippet._id}
                className={`admin-snippet-item ${selectedSnippet?._id === snippet._id ? 'active' : ''}`}
                onClick={() => setSelectedSnippet(snippet)}
              >
                <div className="meta-left">
                  <span className="language-badge small" style={{ backgroundColor: '#666' }}>
                    {snippet.language}
                  </span>
                </div>

                <div className="meta-right">
                  <h3 className="admin-snippet-title">{snippet.title}</h3>
                  <div className="snippet-meta-small">By: <strong>{snippet.submittedBy?.username}</strong></div>
                </div>
              </div>
            ))}
          </div>

          {selectedSnippet && (
            <div className="snippet-preview">
              <h2>{selectedSnippet.title}</h2>
              <div className="preview-meta">
                {/* Split meta into badge column + text column to avoid overlap and ensure spacing */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginRight: '1rem' }}>
                  <span className="language-badge" style={{ backgroundColor: '#666' }}>
                    {selectedSnippet.language}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span>Submitted by: <strong>{selectedSnippet.submittedBy?.username}</strong></span>
                  <span>Email: {selectedSnippet.submittedBy?.email}</span>
                </div>
              </div>

              <div className="preview-section">
                <h3>Problem Description:</h3>
                <p>{selectedSnippet.problemDescription}</p>
              </div>

              <div className="preview-section">
                <h3>Tags:</h3>
                <div className="snippet-tags">
                  {(selectedSnippet.tags || []).map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="preview-section">
                <h3>Code:</h3>
                <SyntaxHighlighter
                  language={selectedSnippet.language}
                  style={vscDarkPlus}
                  showLineNumbers={true}
                  customStyle={{
                    borderRadius: '8px',
                    padding: '20px',
                    fontSize: '14px',
                  }}
                >
                  {selectedSnippet.code ?? ''}
                </SyntaxHighlighter>
              </div>

              <div className="admin-actions">
                <button
                  onClick={() => handleApprove(selectedSnippet._id)}
                  className="btn btn-success"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleDelete(selectedSnippet._id)}
                  className="btn btn-danger"
                >
                  ✗ Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;