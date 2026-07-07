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
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 password reset requests per window
  message: { 
    message: "Too many password reset requests from this IP. Please try again in 15 minutes." 
  },
  standardHeaders: true, 
  legacyHeaders: false,
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", protect, changePassword);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateProfile);

router.post("/forgotpassword", forgotPasswordLimiter, forgotPassword);
router.put("/resetpassword/:token", resetPassword);
export default router;
