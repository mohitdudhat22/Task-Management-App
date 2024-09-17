import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend's base URL
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token in the Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle global response errors (optional)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, possibly redirect to login
      console.log('Unauthorized, redirecting to login...');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
