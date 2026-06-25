// src/context/RideContext.jsx
import { createContext, useState } from 'react';

export const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [activeRides, setActiveRides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to create a new ride
  const createRide = async (rideData) => {
    setIsLoading(true);
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRide = {
          id: Math.random().toString(36).substr(2, 9),
          ...rideData,
          status: 'Waiting',
          members: 1, // The creator
        };
        
        setActiveRides((prev) => [...prev, newRide]);
        setIsLoading(false);
        resolve(newRide);
      }, 1000);
    });
  };

  return (
    <RideContext.Provider value={{ activeRides, isLoading, createRide }}>
      {children}
    </RideContext.Provider>
  );
};