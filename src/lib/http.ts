import axios from "axios";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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
    // Detectar errores de autenticación/autorización
    const status = err?.response?.status;

    let msg;
    if (status === 401) {
      msg = "Inicia sesión para poder realizar esta acción";
    } else if (status === 403) {
      msg = "No tienes permisos para realizar esta acción";
    } else {
      msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error de red o del servidor";
    }

    return Promise.reject(new Error(msg));
  }
);
