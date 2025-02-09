import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:10040";

// ✅ Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔥 Ensures cookies are sent with every request
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
