import axios from 'axios';

// Use a relative path. The browser will automatically prepend the current domain
// (e.g., https://nitotoken.cyou/api/ or http://localhost/api/)
const API_BASE_URL = '/api/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401, attempt a token refresh once; if that fails, boot to login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          // UPDATE: Use the relative API_BASE_URL here instead of localhost
          const { data } = await axios.post(`${API_BASE_URL}auth/token/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(original);
        } catch {
          // refresh also failed – clear session
        }
      }
      localStorage.clear();
      window.location.href = '/login'; // Redirects securely to your login page
    }
    return Promise.reject(error);
  }
);

export default apiClient;