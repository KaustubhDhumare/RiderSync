import axiosInstance from "./axiosInstance";

export const authApi = {
  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  },

  login: async (userData) => {
    try {
      console.log("CHECKPOINT 2 - Axios Sending:", userData);
      const response = await axiosInstance.post("/auth/login", userData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Login failed. Check your credentials.",
      );
    }
  },
};
