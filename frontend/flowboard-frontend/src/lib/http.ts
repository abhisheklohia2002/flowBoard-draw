import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);
