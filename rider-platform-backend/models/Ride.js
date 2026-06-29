// models/Ride.js
import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Please add a ride name'] 
    },
    startLocation: { 
      type: String, 
      required: [true, 'Please add a starting location'] 
    },
    destination: { 
      type: String, 
      required: [true, 'Please add a destination'] 
    },
    date: { 
      type: String, 
      required: [true, 'Please select a date'] 
    },
    time: { 
      type: String, 
      required: [true, 'Please select a time'] 
    },
    maxRiders: {
      type: Number,
      default: 10
    },
    visibility: {
      type: String,
      enum: ['public', 'private'], // Must match your frontend <select> values
      default: 'private'
    },
    creator: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    participants: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      }
    ]
  },
  { timestamps: true }
);

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;