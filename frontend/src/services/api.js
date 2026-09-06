import axios from "axios";

// Aap ka Asli aur Final Render Link
const API_URL = "https://waste-management-system-yw9w.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Secure login ke liye
});

// Token bhejne wala hissa
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
