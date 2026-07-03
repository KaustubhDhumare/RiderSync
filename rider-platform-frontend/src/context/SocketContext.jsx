// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  
  // We use a ref to guarantee the socket only initializes exactly once
  const socketInitialized = useRef(false);

  useEffect(() => {
    if (!socketInitialized.current) {
      console.log("🛠️ SOCKET CONTEXT IS MOUNTING!");

      const newSocket = io('http://localhost:5000', { 
        withCredentials: true,
        transports: ['websocket', 'polling'], 
        autoConnect: true,
        reconnection: true
      });
      
      setSocket(newSocket);
      socketInitialized.current = true;
    }

    // We removed the aggressive cleanup function here so React 
    // doesn't kill the connection while it's still booting up.
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};