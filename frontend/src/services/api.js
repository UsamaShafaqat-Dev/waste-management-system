import axios from "axios";

const API_URL = "https://waste-management-system-yw9w.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For sending cookies/tokens securely
});

export default api;
