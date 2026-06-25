import axiosInstantce from "./axiosInstance";

export const authApi = {
  register: async (userData) => {
    try {
      const response = await axiosInstantce.post("/auth/register", userData);
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
      const response = await axiosInstantce.post("/auth/login", userData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Login failed. Check your credentials.",
      );
    }
  },
};
