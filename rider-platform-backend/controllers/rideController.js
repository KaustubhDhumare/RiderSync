// controllers/rideController.js
import Ride from "../models/Ride.js";

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createRide = async (req, res) => {
  try {
    const {
      name,
      startLocation,
      destination,
      date,
      time,
      maxRiders,
      visibility,
      distance,
      duration,
    } = req.body;

    // Strict Validation to ensure coordinate objects exist
    if (!name || !startLocation?.coords || !destination?.coords || !date || !time) {
      return res.status(400).json({ 
        message: 'Missing required fields. Ensure valid map locations are selected.' 
      });
    }

    // Generate a mathematically unique room code
    let roomCode;
    let isUnique = false;
    while (!isUnique) {
      roomCode = generateRoomCode();
      const existingRide = await Ride.findOne({ roomCode });
      if (!existingRide) isUnique = true;
    }

    const ride = await Ride.create({
      name,
      startLocation,
      destination,
      distance,
      duration,
      date,
      time,
      maxRiders: maxRiders || 10,
      visibility: visibility || "private",
      roomCode,
      creator: req.user._id, // This comes from our auth middleware
      participants: [req.user._id], // The creator automatically joins their own ride
    });

    res.status(201).json(ride);
  } catch (error) {
    console.error("Ride Creation Error:", error);
    res
      .status(500)
      .json({ message: "Failed to create ride room", error: error.message });
  }
};

// @desc    Get all public rides
// @route   GET /api/rides
// @access  Private
export const getRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("creator", "name profilePic") // Updated from 'avatar' to 'profilePic'
      .populate("participants", "name profilePic")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch rides", error: error.message });
  }
};

// @desc    Get single ride by room code
// @route   GET /api/rides/:id
// @access  Private
export const getRideById = async (req, res) => {
  try {
    // req.params.id comes from the URL
    const ride = await Ride.findOne({ roomCode: req.params.id.toUpperCase() })
      .populate("creator", "name profilePic") 
      .populate("participants", "name profilePic"); 

    if (!ride) {
      return res.status(404).json({ message: "Ride room not found" });
    }

    res.json(ride);
  } catch (error) {
    console.error("Fetch Ride Error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching ride details" });
  }
};

// @desc    Get logged in user's rides
// @route   GET /api/rides/my-rides
// @access  Private
export const getUserRides = async (req, res) => {
  try {
    // Find rides where the user is EITHER the creator OR in the participants array
    const rides = await Ride.find({
      $or: [{ creator: req.user._id }, { participants: req.user._id }],
    }).sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your rides" });
  }
};

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Private
export const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // SECURITY CHECK: Ensure the logged-in user is the creator of this ride
    if (ride.creator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this ride" });
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.id,
      req.body, 
      { new: true },
    );

    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: "Failed to update ride" });
  }
};

// @desc    Delete ride
// @route   DELETE /api/rides/:id
// @access  Private
export const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // SECURITY CHECK: Only the creator can delete it
    if (ride.creator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this ride" });
    }

    await ride.deleteOne();
    res.json({ message: "Ride successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete ride" });
  }
};

// @desc    Get user stats for dashboard
// @route   GET /api/rides/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    // FIXED: Query searches for 'creator' matching the schema, not 'createdBy'
    const rides = await Ride.find({ creator: req.user._id });

    // Calculate totals
    const totalRides = rides.length;
    const activeRides = rides.filter((r) => r.status === "active").length;

    // Summing distance and duration, returning them as clean 1-decimal numbers
    const totalDistance = Number(
      rides.reduce((acc, curr) => acc + (curr.distance || 0), 0).toFixed(1)
    );
    const totalHours = Number(
      rides.reduce((acc, curr) => acc + (curr.duration || 0), 0).toFixed(1)
    );

    res.json({ totalRides, activeRides, totalDistance, totalHours });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// new @desc    Join a ride room
// @route   POST /api/rides/:id/join
// @access  Private
export const joinRide = async (req, res) => {
  try {
    const roomCode = req.params.id.toUpperCase();
    const currentUserId = req.user._id;

    // 1. Find the ride to check limits and verify it exists
    const ride = await Ride.findOne({ roomCode });

    if (!ride) {
      return res.status(404).json({ message: "Ride room not found." });
    }

    // 2. If the user is the creator, they don't need to join. Just let them in.
    if (ride.creator.toString() === currentUserId.toString()) {
      return res.json(ride); 
    }

    // 3. Check capacity limits
    const limit = ride.maxRiders || 10;
    const isAlreadyIn = ride.participants.some(p => p.toString() === currentUserId.toString());
    
    if (ride.participants.length >= limit && !isAlreadyIn) {
      return res.status(400).json({ message: "This ride is currently full." });
    }

    // 4. Atomically inject the user ID. 
    // $addToSet guarantees they are only added once, and avoids full-document validation crashes.
    const updatedRide = await Ride.findOneAndUpdate(
      { roomCode },
      { $addToSet: { participants: currentUserId } },
      { new: true } // Returns the fresh document
    );

    res.json(updatedRide);
  } catch (error) {
    // We send error.message to the frontend so you can see exactly why it failed instead of a generic alert.
    console.error("Join Ride Fatal Error:", error);
    res.status(500).json({ message: error.message || "Server error while joining ride." });
  }
};


// @desc    Leave a ride room (Remove user from participants)
// @route   POST /api/rides/:id/leave
// @access  Private
export const leaveRide = async (req, res) => {
  try {
    const roomCode = req.params.id.toUpperCase();
    
    // $pull searches the array and deletes the exact ID match
    const ride = await Ride.findOneAndUpdate(
      { roomCode },
      { $pull: { participants: req.user._id } },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json({ message: "Successfully left the ride" });
  } catch (error) {
    console.error("Leave Ride Error:", error);
    res.status(500).json({ message: "Server error while leaving ride" });
  }
};