import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// Firm endpoints
export const firmApi = {
  list: (params?: Record<string, string>) => api.get('/firms', { params }),
  featured: () => api.get('/firms/featured'),
  topRated: () => api.get('/firms/top-rated'),
  trending: () => api.get('/firms/trending'),
  getBySlug: (slug: string) => api.get(`/firms/${slug}`),
  create: (data: FormData) => api.post('/firms', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/firms/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/firms/${id}`),
};

// Broker endpoints
export const brokerApi = {
  list: () => api.get('/brokers'),
  getBySlug: (slug: string) => api.get(`/brokers/${slug}`),
  create: (data: FormData) => api.post('/brokers', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/brokers/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/brokers/${id}`),
};

// Offer endpoints
export const offerApi = {
  list: () => api.get('/offers'),
  listByFirm: (firmId: string) => api.get(`/offers/firm/${firmId}`),
  create: (data: object) => api.post('/offers', data),
  update: (id: string, data: object) => api.put(`/offers/${id}`, data),
  delete: (id: string) => api.delete(`/offers/${id}`),
};

// Review endpoints
export const reviewApi = {
  listByFirm: (firmId: string, params?: Record<string, string>) => api.get(`/reviews/firm/${firmId}`, { params }),
  create: (data: FormData) => api.post('/reviews', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: object) => api.put(`/reviews/${id}`, data),
  pending: () => api.get('/reviews/admin/pending'),
  updateStatus: (id: string, status: string) => api.patch(`/reviews/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// Compare
export const compareApi = {
  compare: (slugs: string[]) => api.post('/compare', { slugs }),
};

// Search
export const searchApi = {
  search: (q: string) => api.get('/search', { params: { q } }),
};

// Blog
export const blogApi = {
  list: (params?: Record<string, string>) => api.get('/blog', { params }),
  getBySlug: (slug: string) => api.get(`/blog/${slug}`),
  categories: () => api.get('/blog/categories/all'),
  create: (data: FormData) => api.post('/blog', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/blog/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/blog/${id}`),
};

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  topFirms: () => api.get('/analytics/top-firms'),
  pageview: (pageSlug: string, pageType: string) => api.post('/analytics/pageview', { pageSlug, pageType }),
};

// Newsletter
export const newsletterApi = {
  subscribe: (email: string) => api.post('/newsletter/subscribe', { email }),
};

// Settings
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: Record<string, string>) => api.put('/settings', data),
};

// Pages
export const pagesApi = {
  getBySlug: (slug: string) => api.get(`/pages/${slug}`),
  list: () => api.get('/pages'),
  create: (data: object) => api.post('/pages', data),
  update: (id: string, data: object) => api.put(`/pages/${id}`, data),
  delete: (id: string) => api.delete(`/pages/${id}`),
};
