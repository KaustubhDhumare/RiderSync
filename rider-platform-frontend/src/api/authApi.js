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

  changePassword: async (passwordData) => {
    // passwordData should be an object: { oldPassword: '...', newPassword: '...' }
    const response = await axiosInstance.put('/auth/change-password', passwordData);
    return response.data;
  },

  updateProfile: async (profileData) => {
    // Assuming your base routes are set up properly in axiosInstance
    const response = await axiosInstance.put('/auth/profile', profileData); 
    return response.data;
  },
};
