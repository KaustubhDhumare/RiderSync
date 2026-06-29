// controllers/rideController.js
import Ride from '../models/Ride.js';

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
export const createRide = async (req, res) => {
  try {
    const { name, startLocation, destination, date, time, maxRiders, visibility } = req.body;

    const roomCode = generateRoomCode();

    const ride = await Ride.create({
      name,
      startLocation,
      destination,
      date,
      time,
      maxRiders: maxRiders || 10,
      visibility: visibility || 'private',
      roomCode,
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


export const getRideById = async (req, res) => {
  try {
    // req.params.id comes from the URL
    const ride = await Ride.findOne({ roomCode: req.params.id.toUpperCase() })
      .populate('creator', 'name avatar') // Get creator details
      .populate('participants', 'name avatar'); // Get participants details

    if (!ride) {
      return res.status(404).json({ message: 'Ride room not found' });
    }

    res.json(ride);
  } catch (error) {
    console.error("Fetch Ride Error:", error);
    res.status(500).json({ message: 'Server error while fetching ride details' });
  }
};


export const getUserRides = async (req, res) => {
  try {
    // Find rides where the user is EITHER the creator OR in the participants array
    const rides = await Ride.find({
      $or: [
        { creator: req.user._id },
        { participants: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your rides' });
  }
};


export const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // SECURITY CHECK: Ensure the logged-in user is the creator of this ride
    if (ride.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this ride' });
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.id, 
      req.body, // Updates whatever fields are sent (status, name, etc.)
      { new: true } 
    );

    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update ride' });
  }
};


export const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // SECURITY CHECK: Only the creator can delete it
    if (ride.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this ride' });
    }

    await ride.deleteOne();
    res.json({ message: 'Ride successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete ride' });
  }
};