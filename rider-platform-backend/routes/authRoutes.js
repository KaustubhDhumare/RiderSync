import express from 'express'
import { registerUser, loginUser, changePassword, updateProfile,getUserProfile } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();
router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/change-password', protect, changePassword);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateProfile);
export default router