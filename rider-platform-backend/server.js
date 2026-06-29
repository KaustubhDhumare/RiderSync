import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js"
import rideRoutes from './routes/rideRoutes.js'
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use("/api/auth", authRoutes)
app.use('/api/rides', rideRoutes);

app.get("/", (req,resp) =>{
    resp.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server is locked, loaded, and running on port ${PORT}`);
})