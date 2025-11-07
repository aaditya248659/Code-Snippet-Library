import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { snippetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SnippetDetail from '../components/SnippetDetail';
import { toast } from 'react-toastify';
import CodePlayground from '../components/CodePlayground';
import ForksList from '../components/ForksList';

const SnippetView = () => {
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    setLoading(true);
    try {
      const response = await snippetsAPI.getSnippetById(id);
      setSnippet(response.data.snippet);
    } catch (error) {
      toast.error('Failed to fetch snippet');
      console.error(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (snippetId) => {
    try {
      const response = await snippetsAPI.upvoteSnippet(snippetId);
      setSnippet({ ...snippet, upvotes: response.data.upvotes });
      toast.success('Vote updated!');
    } catch (error) {
      toast.error('Failed to upvote snippet');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading snippet...</p>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="container">
        <h2>Snippet not found</h2>
      </div>
    );
  }

  return (
    <div className="container snippet-view-page">
      <button onClick={() => navigate('/')} className="back-button">
        ← Back to Home
      </button>
      <SnippetDetail
        snippet={snippet}
        onUpvote={handleUpvote}
        isAuthenticated={isAuthenticated}
      />
      <CodePlayground 
        initialCode={snippet.code}
        language={snippet.language}
        snippetId={snippet._id}
        snippetOwner={snippet.submittedBy._id}
        currentUser={user}
      />
      <ForksList 
        snippetId={snippet._id}
        snippetOwner={snippet.submittedBy._id}
        onForkAccepted={() => fetchSnippet()}
      />
    </div>
  );
};

export default SnippetView;