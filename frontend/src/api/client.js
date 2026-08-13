import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const client = axios.create({ baseURL });

// Attach the JWT (from /auth/login) to every request that needs it.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("rategate_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize backend error shape: { status, message } from errorHandler.js
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default client;
