// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header (Format: "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the database and attach it to req.user (excluding the password)
      req.user = await User.findById(decoded.id).select('-password');

      // Move on to the next function (e.g., createRide or getRides)
      next(); 
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token was found in the headers at all
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};