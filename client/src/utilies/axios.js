import axios from "axios";

const api = axios.create({
  // ভুল: baseURL: "http://localhost:5000/api",
  baseURL: "https://eventora-event-listing-server.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
