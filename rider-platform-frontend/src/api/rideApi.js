// src/api/rideApi.js
import axiosInstance from './axiosInstance';

export const rideApi = {
  // Post new ride data to the backend
  createRide: async (rideData) => {
    const response = await axiosInstance.post('/rides', rideData);
    return response.data;
  },

  // Fetch all rides for the dashboard
  getRides: async () => {
    const response = await axiosInstance.get('/rides');
    return response.data;
  }
};