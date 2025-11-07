import React, { useState, useEffect } from 'react';
import { playgroundAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ForksList = ({ snippetId, snippetOwner, onForkAccepted }) => {
  const [forks, setForks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFork, setSelectedFork] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchForks();
  }, [snippetId]);

  const fetchForks = async () => {
    try {
      const response = await playgroundAPI.getForks(snippetId);
      setForks(response.data.forks);
    } catch (error) {
      console.error('Failed to fetch forks');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (forkId) => {
    try {
      const response = await playgroundAPI.voteFork(forkId);
      setForks(forks.map(fork => 
        fork._id === forkId ? { ...fork, votes: response.data.votes } : fork
      ));
      toast.success('Vote updated!');
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleAccept = async (forkId) => {
    if (!window.confirm('Accept this fork? This will update your snippet code.')) {
      return;
    }

    try {
      await playgroundAPI.acceptFork(forkId);
      toast.success('Fork accepted! Your snippet has been updated.');
      if (onForkAccepted) onForkAccepted();
      fetchForks();
    } catch (error) {
      toast.error('Failed to accept fork');
    }
  };

  const handleDelete = async (forkId) => {
    if (!window.confirm('Delete this fork?')) {
      return;
    }

    try {
      await playgroundAPI.deleteFork(forkId);
      toast.success('Fork deleted');
      fetchForks();
    } catch (error) {
      toast.error('Failed to delete fork');
    }
  };

  const isOwner = user?._id === snippetOwner;

  if (loading) {
    return <div className="loading-small">Loading forks...</div>;
  }

  if (forks.length === 0) {
    return (
      <div className="no-forks">
        <p>No improvements submitted yet. Be the first to fork and improve this code!</p>
      </div>
    );
  }

  return (
    <div className="forks-list">
      <h3>🍴 Community Improvements ({forks.length})</h3>
      
      <div className="forks-grid">
        {forks.map((fork) => (
          <div key={fork._id} className={`fork-card ${fork.status}`}>
            <div className="fork-header">
              <div className="fork-author">
                <span className="author-avatar">{fork.forkedBy.username.charAt(0).toUpperCase()}</span>
                <div className="author-info">
                  <span className="author-name">{fork.forkedBy.username}</span>
                  <span className="author-level">Level {fork.forkedBy.level}</span>
                </div>
              </div>
              
              <div className="fork-meta">
                <span className={`status-badge ${fork.status}`}>{fork.status}</span>
                <button 
                  onClick={() => handleVote(fork._id)}
                  className="vote-btn"
                  disabled={!user}
                >
                  ▲ {fork.votes}
                </button>
              </div>
            </div>

            <div className="fork-content">
              <h4>{fork.title}</h4>
              <p className="fork-changes">
                <strong>Changes:</strong> {fork.changes}
              </p>
              {fork.description && (
                <p className="fork-description">{fork.description}</p>
              )}

              {fork.testResults && (
                <div className={`test-results ${fork.testResults.success ? 'success' : 'error'}`}>
                  <span className="test-icon">
                    {fork.testResults.success ? '✅' : '❌'}
                  </span>
                  <span>Test {fork.testResults.success ? 'Passed' : 'Failed'}</span>
                </div>
              )}
            </div>

            <div className="fork-actions">
              <button 
                onClick={() => setSelectedFork(selectedFork === fork._id ? null : fork._id)}
                className="btn btn-outline btn-small"
              >
                {selectedFork === fork._id ? 'Hide Code' : 'View Code'}
              </button>

              {isOwner && fork.status === 'pending' && (
                <button 
                  onClick={() => handleAccept(fork._id)}
                  className="btn btn-success btn-small"
                >
                  ✓ Accept
                </button>
              )}

              {(user?._id === fork.forkedBy._id || user?.role === 'admin') && (
                <button 
                  onClick={() => handleDelete(fork._id)}
                  className="btn btn-danger btn-small"
                >
                  🗑️
                </button>
              )}
            </div>

            {selectedFork === fork._id && (
              <div className="fork-code-preview">
                <SyntaxHighlighter
                  language={fork.language}
                  style={vscDarkPlus}
                  showLineNumbers={true}
                  customStyle={{
                    borderRadius: '12px',
                    padding: '1rem',
                    fontSize: '0.9rem',
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}
                >
                  {fork.modifiedCode}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForksList;