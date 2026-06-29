// routes/rideRoutes.js
import express from 'express';
import { createRide, getRides } from '../controllers/rideController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Both routes require the user to be logged in (protected)
router.route('/')
  .post(protect, createRide)
  .get(protect, getRides);

export default router;