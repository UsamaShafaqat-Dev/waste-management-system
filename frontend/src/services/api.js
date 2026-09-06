import axios from "axios";

// 🚨 YAHAN APNA ASLI RENDER WALA LINK LIKHEIN:
const API_URL = "https://waste-management-system-jx3i.vercel.app";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For sending cookies/tokens securely
});

// Yeh hissa laazmi hai taake login token backend tak jaye
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
