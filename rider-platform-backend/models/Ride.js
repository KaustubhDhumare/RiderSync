// models/Ride.js
import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a ride name"],
    },
    startLocation: {
      name: { type: String, required: true },
      coords: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    destination: {
      name: { type: String, required: true },
      coords: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    date: {
      type: String,
      required: [true, "Please select a date"],
    },
    time: {
      type: String,
      required: [true, "Please select a time"],
    },
    maxRiders: {
      type: Number,
      default: 10,
    },
    visibility: {
      type: String,
      enum: ["public", "private"], // Must match your frontend <select> values
      default: "private",
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed", "cancelled"],
      default: "upcoming",
    },
    distance: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true, // Ensures no two rides ever have the same code
    },
    statsCalculated: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;
