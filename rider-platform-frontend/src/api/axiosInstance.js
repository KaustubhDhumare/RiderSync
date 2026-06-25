import axios from "axios";
import { BASE_URL } from "../constants/constants";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// axiosInstantce.interceptors.request.use(
//     (config)=>{
//         const token = localStorage.getItem("token")

//         if(token){
//             config.headers['Authorization'] = `Bearer ${token}`
//         }
//         return config;
//     },
//     (error)=>{
//         return Promise.reject(error)
//     }
// );

axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // If unauthorized (token expired/invalid), wipe the token and force login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
