import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '/api';
const baseURL = rawBaseURL.endsWith('/') && rawBaseURL.length > 1
  ? rawBaseURL.slice(0, -1)
  : rawBaseURL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('scholarnest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error & 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only redirect if route requires auth and not already on /login
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/'
      ) {
        localStorage.removeItem('scholarnest_token');
        localStorage.removeItem('scholarnest_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

export const scholarshipAPI = {
  getScholarships: (params) => api.get('/scholarships', { params }),
  getScholarshipById: (id) => api.get(`/scholarships/${id}`),
};

export const matchAPI = {
  getMatches: () => api.get('/matches'),
  postMatches: (data) => api.post('/matches', data),
};

export const savedAPI = {
  getSaved: () => api.get('/saved'),
  saveScholarship: (scholarshipId) => api.post(`/saved/${scholarshipId}`),
  unsaveScholarship: (scholarshipId) => api.delete(`/saved/${scholarshipId}`),
};

export const applicationAPI = {
  getApplications: () => api.get('/applications'),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  createApplication: (data) => api.post('/applications', data),
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
};

export const documentAPI = {
  getDocuments: () => api.get('/documents'),
  uploadDocument: (formData) =>
    api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  analyzeDocument: (id) => api.post(`/documents/${id}/analyze`),
};

export const aiAPI = {
  getEligibilityExplanation: (scholarshipId, language = 'English') =>
    api.post('/ai/eligibility-explanation', { scholarshipId, language }),
  askNestGuide: (message, scholarshipContext = null, history = [], language = 'English') =>
    api.post('/ai/nestguide', { message, scholarshipContext, history, language }),
  getScholarshipSummary: (scholarshipId, language = 'English') =>
    api.post('/ai/scholarship-summary', { scholarshipId, language }),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export default api;
