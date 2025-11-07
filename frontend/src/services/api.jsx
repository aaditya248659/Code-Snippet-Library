import axios from 'axios';

// Use Vite environment variable in production and fall back to localhost for development
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://code-snippet-library-blond.vercel.app/') + '/api';

const api = axios.create ({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use (
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = { 
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// Snippets API
export const snippetsAPI = {
    getAllSnippets: (params) => api.get('/snippets', { params }),
    getSnippetById: (id) => api.get(`/snippets/${id}`),
    submitSnippet: (snippetData) => api.post('/snippets/submit', snippetData),
    updateSnippet: (id, snippetData) => api.put(`/snippets/${id}`, snippetData),
    deleteSnippet: (id) => api.delete(`/snippets/user/${id}`),
    upvoteSnippet: (id) => api.patch(`/snippets/upvote/${id}`),
    favoriteSnippet: (id) => api.patch(`/snippets/favorite/${id}`),
    addComment: (id, text) => api.post(`/snippets/${id}/comment`, { text }),
    deleteComment: (snippetId, commentId) => api.delete(`/snippets/${snippetId}/comment/${commentId}`),
    getPendingSnippets: () => api.get('/snippets/pending/all'),
    approveSnippet: (id) => api.patch(`/snippets/approve/${id}`),
    deleteSnippetAdmin: (id) => api.delete(`/snippets/${id}`),
};

// Users API
export const usersAPI = {
    getUserProfile: (username) => api.get(`/users/${username}`),
    getUserSnippets: (username) => api.get(`/users/${username}/snippets`),
    getFavorites: () => api.get('/users/me/favorites'),
    updateProfile: (profileData) => api.put('/users/me/profile', profileData),
};

// Gamification API
export const gamificationAPI = {
    getLeaderboard: (params) => api.get('/gamification/leaderboard', { params }),
    getBadges: () => api.get('/gamification/badges'),
    getUserStats: (username) => api.get(`/gamification/stats/${username}`),
    awardPoints: (userId, points, reason) => api.post('/gamification/award-points', { userId, points, reason }),
};

// Analytics API
export const analyticsAPI = {
    getOverview: () => api.get('/analytics/overview'),
    getLanguageDistribution: () => api.get('/analytics/language-distribution'),
    getTrending: () => api.get('/analytics/trending'),
    getUserActivity: (username) => api.get(`/analytics/user/${username}/activity`),
    getUserChart: (username) => api.get(`/analytics/user/${username}/chart`),
};

// AI API
export const aiAPI = {
    explainCode: (code, language) => api.post('/ai/explain', { code, language }),
    optimizeCode: (code, language) => api.post('/ai/optimize', { code, language }),
};

// Add Playground API
export const playgroundAPI = {
    executeCode: (code, language, input) => api.post('/playground/execute', { code, language, input }),
    forkSnippet: (forkData) => api.post('/playground/fork', forkData),
    getForks: (snippetId) => api.get(`/playground/forks/${snippetId}`),
    voteFork: (forkId) => api.patch(`/playground/fork/${forkId}/vote`),
    acceptFork: (forkId) => api.patch(`/playground/fork/${forkId}/accept`),
    deleteFork: (forkId) => api.delete(`/playground/fork/${forkId}`),
};

export default api;