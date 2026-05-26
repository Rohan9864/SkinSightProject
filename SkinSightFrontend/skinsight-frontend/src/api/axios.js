import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization =
          `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally, but ignore auth endpoints so login/register
// can show validation errors instead of refreshing the page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    const isAuthEndpoint = url.includes('/api/auth/login')
      || url.includes('/api/auth/register')
      || url.includes('/api/auth/forgot-password')
      || url.includes('/api/auth/reset-password');

    if (status === 401 && !isAuthEndpoint) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;