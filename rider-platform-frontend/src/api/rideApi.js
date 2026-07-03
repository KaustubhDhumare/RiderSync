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
  },

  getRideById: async (id) => {
    const response = await axiosInstance.get(`/rides/${id}`);
    return response.data;
  },

  getUserRides: async () => {
    const response = await axiosInstance.get('/rides/my-rides');
    return response.data;
  },

  updateRide: async (id, updatedData) => {
    // Requires the MongoDB _id, not the roomCode
    const response = await axiosInstance.put(`/rides/${id}`, updatedData);
    return response.data;
  },

  deleteRide: async (id) => {
    // Requires the MongoDB _id
    const response = await axiosInstance.delete(`/rides/${id}`);
    return response.data;
  },

  // Add this inside your existing rideApi object
joinRide: async (roomCode) => {
    // We pass an empty object {} because it's a POST request without a body payload
    const response = await axiosInstance.post(`/rides/${roomCode}/join`, {});
    return response.data;
  },
  
  // Leave a ride room
  leaveRide: async (roomCode) => {
    const response = await axiosInstance.post(`/rides/${roomCode}/leave`, {});
    return response.data;
  },


};