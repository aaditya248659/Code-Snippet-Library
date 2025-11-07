import React, { useState, useEffect } from 'react';
import { usersAPI, snippetsAPI } from '../services/api';
import SnippetCard from '../components/SnippetCard';
import { toast } from 'react-toastify';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getFavorites();
      setFavorites(response.data.favorites);
    } catch (error) {
      toast.error('Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (snippetId) => {
    try {
      const response = await snippetsAPI.upvoteSnippet(snippetId);
      setFavorites(favorites.map(snippet => 
        snippet._id === snippetId 
          ? { ...snippet, upvotes: response.data.upvotes }
          : snippet
      ));
      toast.success('Vote updated!');
    } catch (error) {
      toast.error('Failed to upvote snippet');
    }
  };

  const handleDelete = async (snippetId) => {
    try {
      await snippetsAPI.deleteSnippet(snippetId);
      setFavorites(favorites.filter(s => s._id !== snippetId));
      toast.success('Snippet deleted');
    } catch (error) {
      toast.error('Failed to delete snippet');
    }
  };

  return (
    <div className="container favorites-page">
      <div className="page-header">
        <h1>My Favorites</h1>
        <p>Snippets you've bookmarked for later</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="no-results">
          <h2>No favorites yet</h2>
          <p>Start bookmarking snippets you find useful!</p>
        </div>
      ) : (
        <div className="snippets-grid">
          {favorites.map((snippet) => (
            <SnippetCard
              key={snippet._id}
              snippet={snippet}
              onUpvote={handleUpvote}
              isAuthenticated={true}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;