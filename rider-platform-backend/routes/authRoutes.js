import express from "express";
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
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", protect, changePassword);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateProfile);

router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);
export default router;
