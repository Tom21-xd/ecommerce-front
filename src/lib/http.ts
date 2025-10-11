import axios from "axios";

export const http = axios.create({
  baseURL: "https://v31ppm97-4000.use.devtunnels.ms/",
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("jwt_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Error de red o del servidor";
    return Promise.reject(new Error(msg));
  }
);
