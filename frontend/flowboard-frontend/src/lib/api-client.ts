import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;

let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    const isAuthRequest =
      requestUrl.includes("/api/user/login") ||
      requestUrl.includes("/api/user/register") ||
      requestUrl.includes("/api/user/refresh") ||
      requestUrl.includes("/api/user/logout");

    if (status !== 401 || originalRequest._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(apiClient(originalRequest)),
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      await apiClient.post("/api/user/refresh");

      processQueue(null);

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);