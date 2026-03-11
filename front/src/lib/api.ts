// MIS API Client
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { getCSRFToken } from "@/utils/csrf";

// --- Helper Functions for Token Management ---

export const getAccessToken = (): string | null => {
  return sessionStorage.getItem("accessToken");
};

export const setAccessToken = (token: string): void => {
  sessionStorage.setItem("accessToken", token);
};

const clearAccessToken = (): void => {
  sessionStorage.removeItem("accessToken");
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const REFRESH_ENDPOINT = "/accounts/token/refresh/";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth tokens or other headers
apiClient.interceptors.request.use(
  async (config) => {
    // JWT Token
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRF token handling
    const csrfToken = getCSRFToken();
    if (csrfToken && config.method !== "get") {
      config.headers["X-CSRFToken"] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let isRedirectingToLogin = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const normalizeUrl = (url?: string) => {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }

  return url;
};

const isRefreshRequest = (url?: string) => {
  const normalizedUrl = normalizeUrl(url);
  return normalizedUrl.includes(REFRESH_ENDPOINT);
};

const shouldAttemptTokenRefresh = (
  error: AxiosError,
  request?: InternalAxiosRequestConfig & { _retry?: boolean }
) => {
  if (error.response?.status !== 401 || !request) {
    return false;
  }

  if (request._retry || isRefreshRequest(request.url)) {
    return false;
  }

  return Boolean(getAccessToken());
};

const clearAuthAndRedirectToLogin = () => {
  clearAccessToken();
  useUserStore.getState().logout();

  if (isRedirectingToLogin) {
    return;
  }

  isRedirectingToLogin = true;
  window.location.replace("/auth/login?session_expired=true");
};

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (!shouldAttemptTokenRefresh(error as AxiosError, originalRequest)) {
      if ((error as AxiosError).response?.status === 401 && isRefreshRequest(originalRequest?.url)) {
        clearAuthAndRedirectToLogin();
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => apiClient(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}${REFRESH_ENDPOINT}`,
        {},
        { withCredentials: true }
      );

      setAccessToken(data.access);
      apiClient.defaults.headers.common.Authorization = `Bearer ${data.access}`;

      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError);
      clearAuthAndRedirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
