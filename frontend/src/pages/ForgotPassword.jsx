import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultLinks, setResultLinks] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend forgot-password endpoint
      const { data } = await (await import('../services/api')).authAPI.forgotPassword(email);
      // If backend returns resetUrl/previewUrl (no SMTP or ethereal), display it in UI for dev
      if (data.resetUrl || data.previewUrl) {
        setResultLinks({ resetUrl: data.resetUrl, previewUrl: data.previewUrl });
        toast.success('Reset link generated — see below');
        return; // don't redirect; let user click the link
      }

      toast.success(data.message || 'If an account exists for this email, reset instructions have been sent.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Enter your account email and we'll send reset instructions.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset instructions'}
          </button>
        </form>

        {resultLinks ? (
          <div className="auth-result">
            <p>Development links (copy/open to continue):</p>
            {resultLinks.resetUrl && (
              <p>
                Reset link: <a href={resultLinks.resetUrl} target="_blank" rel="noreferrer">{resultLinks.resetUrl}</a>
              </p>
            )}
            {resultLinks.previewUrl && (
              <p>
                Email preview: <a href={resultLinks.previewUrl} target="_blank" rel="noreferrer">Open preview</a>
              </p>
            )}
            <p style={{ marginTop: '0.5rem' }}>Remembered your password? <Link to="/login">Return to login</Link></p>
          </div>
        ) : (
          <p className="auth-footer">
            Remembered your password? <Link to="/login">Return to login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
