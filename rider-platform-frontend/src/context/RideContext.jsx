// src/context/RideContext.jsx
import { createContext, useState, useCallback } from 'react';
import { rideApi } from '../api/rideApi';

export const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRide = async (rideData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newRide = await rideApi.createRide(rideData);
      
      // Add the newly created ride to the beginning of our local state array
      setRides((prevRides) => [newRide, ...prevRides]);
      
      return newRide; // Return it so CreateRide.jsx can navigate to the new ID
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create ride';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRides = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await rideApi.getRides();
      setRides(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rides');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <RideContext.Provider value={{ rides, isLoading, error, createRide, fetchRides }}>
      {children}
    </RideContext.Provider>
  );
};