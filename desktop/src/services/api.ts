/**
 * API Client Configuration — DevVerse Desktop
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach Access Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devverse_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract error messages & field error arrays
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    let message = data?.message || error.message || 'An unexpected error occurred.';

    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const detailedMsgs = data.errors.map((e: { field: string; message: string }) => `${e.message}`).join(' • ');
      message = `${message} (${detailedMsgs})`;
    }

    return Promise.reject(new Error(message));
  }
);
