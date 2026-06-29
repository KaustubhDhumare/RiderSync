// routes/rideRoutes.js
import express from 'express';
import { createRide, getRides, getRideById, getUserRides, updateRide, deleteRide } from '../controllers/rideController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Both routes require the user to be logged in (protected)
router.route('/')
  .post(protect, createRide)
  .get(protect, getRides);

router.route('/my-rides')
  .get(protect, getUserRides);

router.route('/:id')
  .get(protect, getRideById)
  .put(protect, updateRide)   
  .delete(protect, deleteRide);


export default router;