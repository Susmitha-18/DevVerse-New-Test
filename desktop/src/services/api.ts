/**
 * API Client Configuration — DevVerse Desktop
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devverse_access_token');
    const sessionId = localStorage.getItem('devverse_session_id');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (sessionId && config.headers) {
      config.headers['x-session-id'] = sessionId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatic token refresh on 401 & error formatting
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network / Connection Errors
    if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return Promise.reject(
        new Error('Unable to connect to backend server (http://localhost:5000). Please make sure the backend server is running.')
      );
    }

    // 401 Refresh Token Retry logic
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const sessionId = localStorage.getItem('devverse_session_id') || undefined;
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { sessionId },
          { withCredentials: true }
        );

        const newAccessToken = res.data?.data?.accessToken;
        const newSessionId = res.data?.data?.sessionId;

        if (newAccessToken) {
          localStorage.setItem('devverse_access_token', newAccessToken);
          if (newSessionId) {
            localStorage.setItem('devverse_session_id', newSessionId);
          }
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          processQueue(null);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr);
        localStorage.removeItem('devverse_access_token');
        localStorage.removeItem('devverse_session_id');
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const data = error.response?.data;
    let message = data?.message || error.message || 'An unexpected error occurred.';

    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const detailedMsgs = data.errors.map((e: { field: string; message: string }) => `${e.message}`).join(' • ');
      message = `${message} (${detailedMsgs})`;
    }

    return Promise.reject(new Error(message));
  }
);

