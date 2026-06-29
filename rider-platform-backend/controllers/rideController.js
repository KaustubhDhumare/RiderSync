// controllers/rideController.js
import Ride from '../models/Ride.js';

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private
export const createRide = async (req, res) => {
  try {
    const { name, startLocation, destination, date, time, maxRiders, visibility } = req.body;

    const ride = await Ride.create({
      name,
      startLocation,
      destination,
      date,
      time,
      maxRiders: maxRiders || 10,
      visibility: visibility || 'private',
      creator: req.user._id, // This comes from our auth middleware
      participants: [req.user._id] // The creator automatically joins their own ride
    });

    res.status(201).json(ride);
  } catch (error) {
    console.error("Ride Creation Error:", error);
    res.status(500).json({ message: 'Failed to create ride room', error: error.message });
  }
};

// @desc    Get all public rides
// @route   GET /api/rides
// @access  Private
export const getRides = async (req, res) => {
  try {
    // For the dashboard, we probably only want to show 'public' rides, 
    // or rides where the user is already a participant. 
    // For now, let's fetch all rides to ensure it works.
    const rides = await Ride.find()
      .populate('creator', 'name avatar')
      .populate('participants', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rides', error: error.message });
  }
};