import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { sessionManager } from '../utils/sessionManager';
import { refreshToken as refreshTokenApi } from './auth';
import { notifyApiError, getApiErrorMessage } from './errorHandler';

const baseURL =
  typeof process !== 'undefined' && process.env?.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : 'http://localhost:8092';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = sessionManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    if (status === 401 && !originalRequest._retry) {
      if (errorCode === 'INVALID_CREDENTIALS') {
        return Promise.reject(error);
      }
      const refresh = sessionManager.getRefreshToken();
      if (!refresh) {
        sessionManager.clearSession();
        window.location.href = window.location.origin + window.location.pathname;
        return Promise.reject(error);
      }
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
        const { token: newToken, refreshToken: newRefresh, user } = await refreshTokenApi(refresh);
        sessionManager.saveSession(user, newToken, newRefresh);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        sessionManager.clearSession();
        window.location.href = window.location.origin + window.location.pathname;
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const message = getApiErrorMessage(error);

    if (status === 403) {
      notifyApiError(error.response?.data?.message ?? 'Bu işlem için yetkiniz yok.', errorCode);
    } else if (status && status >= 500) {
      notifyApiError(message, errorCode);
    } else if (error.message === 'Network Error') {
      notifyApiError(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
