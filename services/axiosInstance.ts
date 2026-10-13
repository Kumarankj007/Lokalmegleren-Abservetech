import axios from "axios";
import { APIURLS } from "./config";

const axiosInstance = axios.create({
  baseURL: APIURLS.baseUrl,
});
// axiosInstance.defaults.headers['ngrok-skip-browser-warning'] = true
// axiosInstance.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

axiosInstance.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  
  config.headers["ngrok-skip-browser-warning"] = "true";

  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    // console.log(error);
    
    if (error.response?.status === 401) {
      console.warn("Token expired or unauthorized");

      // Remove old token
      localStorage.removeItem("token");

      // Redirect to login
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;