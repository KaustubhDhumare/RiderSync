import express from "express";
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  loginUser,
  changePassword,
  updateProfile,
  getUserProfile,
  resetPassword,
  forgotPassword
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Limiter 1: Protects the outbound email API
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per IP
  message: { 
    message: "Too many password reset requests from this IP. Please try again in 15 minutes." 
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

// Limiter 2: Protects the database from DoS attacks on token lookups
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts allows for a few regex validation mistakes
  message: { 
    message: "Too many reset attempts. Please request a new link in 15 minutes." 
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", protect, changePassword);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateProfile);

// Inject the limiters directly into the auth pipelines
router.post("/forgotpassword", forgotPasswordLimiter, forgotPassword);
router.put("/resetpassword/:token", resetPasswordLimiter, resetPassword);

export default router;