import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js"
import rideRoutes from './routes/rideRoutes.js'

import http from 'http'
import { Server } from 'socket.io';


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use("/api/auth", authRoutes)
app.use('/api/rides', rideRoutes);


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Update this if your frontend runs on a different port
    methods: ["GET", "POST"],
    credentials: true
  }
});


// 4. Socket.io Event Listeners (The Traffic Controller)
io.on('connection', (socket) => {
  console.log(`User Connected to WebSockets: ${socket.id}`);

  // When a user enters a RideRoom on the frontend
  socket.on('joinRoom', (roomCode) => {
    socket.join(roomCode);
    console.log(`Socket ${socket.id} joined room: ${roomCode}`);
  });

  // When a user's phone GPS sends a new coordinate
  socket.on('locationUpdate', (data) => {
    // data must contain: { roomCode, userId, name, lat, lng, speed }
    // socket.to().emit broadcasts to everyone in the room EXCEPT the sender
    socket.to(data.roomCode).emit('locationUpdate', data);
  });
  socket.on('rideCompleted', (roomCode) => {
    // Blast a message to everyone in the room to trigger the redirect
    io.to(roomCode).emit('rideCompleted');
  });

  // When a user leaves the page
  socket.on('leaveRoom', (roomCode) => {
    socket.leave(roomCode);
    console.log(`Socket ${socket.id} left room: ${roomCode}`);
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
}); 

// app.get("/", (req,resp) =>{
//     resp.send("API is running...");
// });

const PORT = process.env.PORT || 5000;
// server.listen(PORT, ()=>{
//     console.log(`Server is locked, loaded, and running on port ${PORT} with WebSockets`);
// })
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is locked, loaded, and running on port ${PORT} with WebSockets`);
});