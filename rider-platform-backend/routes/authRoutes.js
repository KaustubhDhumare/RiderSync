import express from 'express'
import { registerUser, loginUser, changePassword, updateProfile } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/change-password', protect, changePassword);
router.put('/profile', protect, updateProfile);

export default router