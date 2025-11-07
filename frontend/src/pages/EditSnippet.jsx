import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { snippetsAPI } from '../services/api';
import { toast } from 'react-toastify';

const EditSnippet = () => {
  const [formData, setFormData] = useState({
    title: '',
    problemDescription: '',
    language: 'javascript',
    tags: '',
    code: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const languages = [
    'cpp', 'python', 'javascript', 'java', 'c',
    'go', 'rust', 'typescript', 'php', 'ruby'
  ];

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    try {
      const response = await snippetsAPI.getSnippetById(id);
      const snippet = response.data.snippet;
      
      setFormData({
        title: snippet.title,
        problemDescription: snippet.problemDescription,
        language: snippet.language,
        tags: snippet.tags.join(', '),
        code: snippet.code,
      });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch snippet');
      navigate('/');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const snippetData = {
        ...formData,
        tags: tagsArray,
      };

      await snippetsAPI.updateSnippet(id, snippetData);
      toast.success('Snippet updated successfully! It will be re-reviewed.');
      navigate(`/snippet/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update snippet';
      toast.error(message);
    } finally {
      setSubmitting(false);
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

  return (
    <div className="container submit-page">
      <div className="submit-header">
        <h1>Edit Code Snippet</h1>
        <p>Update your snippet. It will need admin approval again.</p>
      </div>

      <form onSubmit={handleSubmit} className="submit-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Find Digital Root of a Number"
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="problemDescription">Problem Description *</label>
          <textarea
            id="problemDescription"
            name="problemDescription"
            value={formData.problemDescription}
            onChange={handleChange}
            placeholder="Describe what this code snippet solves..."
            required
            rows={4}
            maxLength={1000}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="language">Language *</label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              required
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., arrays, math, beginner"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="code">Code *</label>
          <textarea
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Paste your code here..."
            required
            rows={15}
            className="code-textarea"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/snippet/${id}`)}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Snippet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSnippet;