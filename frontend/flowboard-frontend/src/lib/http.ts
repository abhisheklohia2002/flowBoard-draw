import axios, {
  AxiosError,
  AxiosRequestConfig,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// export const http: AxiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
//   // headers: {
//   //   "Content-Type": "application/json",
//   // },
// });
// const refreshHttp = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
//   // headers: {
//   //   "Content-Type": "application/json",
//   // },
// });

// type RetryConfig = InternalAxiosRequestConfig & {
//   _retry?: boolean;
// };

// let isRefreshing = false;

// let failedQueue: {
//   resolve: () => void;
//   reject: (error: unknown) => void;
// }[] = [];

// const processQueue = (error: unknown = null) => {
//   failedQueue.forEach((promise) => {
//     if (error) {
//       promise.reject(error);
//     } else {
//       promise.resolve();
//     }
//   });

//   failedQueue = [];
// };

// http.interceptors.response.use(
//   (response) => response,

//   async (error: AxiosError) => {
//     const originalRequest = error.config as RetryConfig | undefined;

//     if (!originalRequest) {
//       return Promise.reject(error);
//     }

//     const status = error.response?.status;
//     const requestUrl = originalRequest.url ?? "";


//     const isAuthRoute =
//       requestUrl.includes("/api/user/login") ||
//       requestUrl.includes("/api/user/register") ||
//       requestUrl.includes("/api/user/refresh");

//     if (status === 401 && !originalRequest._retry && !isAuthRoute) {
//       originalRequest._retry = true;
//       if (isRefreshing) {
//         return new Promise<void>((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(() => {
//           return http(originalRequest);
//         });
//       }

//       isRefreshing = true;

//       try {
//         await refreshHttp.post("/api/user/refresh");

//         processQueue(null);

//         return http(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError);


//         // window.location.href = "/auth";

//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     const message =
//       (error.response?.data as { message?: string })?.message ||
//       error.message ||
//       "Something went wrong";

//     return Promise.reject(new Error(message));
//   }
// );



export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // headers: { "Content-Type": "application/json" },
});
type RetryAxiosRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<any> | null = null;
http.interceptors.request.use((config) => {
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }

  return config;
});
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = originalRequest.url || "";

    const isRefreshApi = requestUrl.includes("/api/user/refresh");
    const isLoginApi = requestUrl.includes("/api/user/login");
    // const isLogoutApi = requestUrl.includes("/api/auth/logout");

    if (
      status !== 401 ||
      originalRequest._retry ||
      isRefreshApi ||
      isLoginApi
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = http.post("/api/user/refresh");
        const self = http.get("/api/user/self");
        await Promise.all([refreshPromise, self]);
      }

      await refreshPromise;

      return http.request(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("lms_user_id");
      localStorage.removeItem("lms_role");

      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);