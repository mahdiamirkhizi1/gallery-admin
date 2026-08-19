import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3002/api/v1",
  timeout: 15_000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("goldino_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem("goldino_admin_token");
    localStorage.removeItem("goldino_admin_user");
    if (location.pathname !== "/login") location.assign("/login");
  }
  return Promise.reject(error);
});
