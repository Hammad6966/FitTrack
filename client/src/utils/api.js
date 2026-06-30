import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fittrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fittrack_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  logout:         ()     => api.post('/auth/logout'),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const exerciseAPI = {
  getAll:        (params)     => api.get('/exercises', { params }),
  getFeatured:   ()           => api.get('/exercises/featured'),
  getById:       (id)         => api.get(`/exercises/${id}`),
  create:        (data)       => api.post('/exercises', data),
  update:        (id, data)   => api.put(`/exercises/${id}`, data),
  delete:        (id)         => api.delete(`/exercises/${id}`),
  toggleFeatured:(id)         => api.put(`/exercises/${id}/featured`),
};

export const mealAPI = {
  getAll:        (params)     => api.get('/meals', { params }),
  getFeatured:   ()           => api.get('/meals/featured'),
  getById:       (id)         => api.get(`/meals/${id}`),
  create:        (data)       => api.post('/meals', data),
  update:        (id, data)   => api.put(`/meals/${id}`, data),
  delete:        (id)         => api.delete(`/meals/${id}`),
};

export const progressAPI = {
  getAll:        ()           => api.get('/progress'),
  getStats:      ()           => api.get('/progress/stats'),
  create:        (data)       => api.post('/progress', data),
  update:        (id, data)   => api.put(`/progress/${id}`, data),
  delete:        (id)         => api.delete(`/progress/${id}`),
};

export const communityAPI = {
  getPosts:      (params)     => api.get('/community', { params }),
  getPost:       (id)         => api.get(`/community/${id}`),
  createPost:    (data)       => api.post('/community', data),
  likePost:      (id)         => api.put(`/community/${id}/like`),
  addComment:    (id, data)   => api.post(`/community/${id}/comments`, data),
  deleteComment: (id, cid)    => api.delete(`/community/${id}/comments/${cid}`),
  deletePost:    (id)         => api.delete(`/community/${id}`),
};

export const adminAPI = {
  getDashboard:      ()           => api.get('/admin/dashboard'),
  getAnalytics:      ()           => api.get('/admin/analytics'),
  getUsers:          (params)     => api.get('/admin/users', { params }),
  updateUserRole:    (id, role)   => api.put(`/admin/users/${id}/role`, { role }),
  toggleUserStatus:  (id)         => api.put(`/admin/users/${id}/status`),
  deleteUser:        (id)         => api.delete(`/admin/users/${id}`),
  getPosts:          (params)     => api.get('/admin/posts', { params }),
  approvePost:       (id)         => api.put(`/admin/posts/${id}/approve`),
};
