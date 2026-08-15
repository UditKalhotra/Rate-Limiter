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
    const code = err.response?.data?.code;
    const message =
      err.response?.data?.message ||
      err.message ||
      "Something went wrong. Please try again.";

    // Session expired or the token is otherwise invalid — clear it and
    // send the user back to login instead of leaving them stuck on a
    // screen that will just keep failing.
    if (code === "TOKEN_EXPIRED" || code === "TOKEN_INVALID") {
      localStorage.removeItem("rategate_token");
      localStorage.removeItem("rategate_name");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=1";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default client;
