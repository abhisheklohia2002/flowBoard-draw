import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
const refreshHttp = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isRefreshing = false;

let failedQueue: {
  resolve: () => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

http.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = originalRequest.url ?? "";


    const isAuthRoute =
      requestUrl.includes("/api/user/login") ||
      requestUrl.includes("/api/user/register") ||
      requestUrl.includes("/api/user/refresh");

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return http(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        await refreshHttp.post("/api/user/refresh");

        processQueue(null);

        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);


        // window.location.href = "/auth";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);