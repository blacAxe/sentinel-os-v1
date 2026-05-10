import axios from "axios";

const vortex = axios.create({
  baseURL: "http://localhost:8081/vortex",
});

vortex.interceptors.request.use((config) => {
  const token = localStorage.getItem("sentinel_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default vortex;