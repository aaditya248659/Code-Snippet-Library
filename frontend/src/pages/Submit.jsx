import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { snippetsAPI } from '../services/api';
import { toast } from 'react-toastify';

const Submit = () => {
  const [formData, setFormData] = useState({
    title: '',
    problemDescription: '',
    language: 'javascript',
    tags: '',
    code: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const languages = [
    'cpp', 'python', 'javascript', 'java', 'c',
    'go', 'rust', 'typescript', 'php', 'ruby'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const snippetData = {
        ...formData,
        tags: tagsArray,
      };

      await snippetsAPI.submitSnippet(snippetData);
      toast.success('Snippet submitted successfully! It will be reviewed by an admin.');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit snippet';
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container submit-page">
      <div className="submit-header">
        <h1>Submit a Code Snippet</h1>
        <p>Share your knowledge with the community! Your snippet will be reviewed before publication.</p>
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
            onClick={() => navigate('/')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Snippet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Submit;