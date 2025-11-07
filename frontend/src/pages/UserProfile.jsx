import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SnippetCard from '../components/SnippetCard';
import { snippetsAPI } from '../services/api';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');
  const [githubProfile, setGithubProfile] = useState('');
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchUserSnippets();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const response = await usersAPI.getUserProfile(username);
      setUser(response.data.user);
      setBio(response.data.user.bio || '');
      setGithubProfile(response.data.user.githubProfile || '');
    } catch (error) {
      toast.error('Failed to fetch user profile');
      navigate('/');
    }
  };

  const fetchUserSnippets = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getUserSnippets(username);
      setSnippets(response.data.snippets);
    } catch (error) {
      toast.error('Failed to fetch snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.updateProfile({ bio, githubProfile });
      toast.success('Profile updated successfully!');
      setEditMode(false);
      fetchUserProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const isOwnProfile = currentUser?.username === username;

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container user-profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-icon">{user.username.charAt(0).toUpperCase()}</span>
        </div>
        
        <div className="profile-info">
          <h1 className="profile-username">{user.username}</h1>
          {user.role === 'admin' && <span className="admin-badge">Admin</span>}
          
          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="profile-edit-form">
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={200}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="github">GitHub Profile</label>
                <input
                  type="url"
                  id="github"
                  value={githubProfile}
                  onChange={(e) => setGithubProfile(e.target.value)}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" onClick={() => setEditMode(false)} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {user.bio && <p className="profile-bio">{user.bio}</p>}
              
              <div className="profile-links">
                {user.githubProfile && (
                  <a href={user.githubProfile} target="_blank" rel="noopener noreferrer" className="profile-link">
                    🔗 GitHub
                  </a>
                )}
              </div>
              
              {isOwnProfile && (
                <button onClick={() => setEditMode(true)} className="btn btn-outline">
                  Edit Profile
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-number">{user.stats?.totalContributions || 0}</div>
          <div className="stat-label">Total Contributions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{user.stats?.approvedSnippets || 0}</div>
          <div className="stat-label">Approved Snippets</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{user.stats?.totalUpvotes || 0}</div>
          <div className="stat-label">Total Upvotes</div>
        </div>
      </div>

      <div className="profile-snippets">
        <h2>Contributed Snippets</h2>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : snippets.length === 0 ? (
          <div className="no-results">
            <p>No snippets yet</p>
          </div>
        ) : (
          <div className="snippets-grid">
            {snippets.map((snippet) => (
              <SnippetCard 
                key={snippet._id} 
                snippet={snippet} 
                onDelete={async (id) => {
                  try {
                    await snippetsAPI.deleteSnippet(id);
                    setSnippets(snippets.filter(s => s._id !== id));
                    toast.success('Snippet deleted');
                  } catch (err) {
                    toast.error('Failed to delete snippet');
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;