// controllers/userController.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, avatar } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔴 THE FIX: Validate EVERYTHING before touching the database
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ message: "Name must contain only letters." });
    }
    
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must be exactly 10 digits." });
    }
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 chars, 1 uppercase, and 1 number.",
      });
    }

    // Now it is safe to save to the database
    const user = await User.create({
      name,
      email,
      password,
      phone,
      avatar
    });

    if (user) {
      // 🔴 THE FIX: Send the FULL profile back to React
      res.status(201).json({
        user: { // Fixed typo from 'uesr'
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          bio: user.bio,
          totalRides: user.totalRides || 0,
          totalDistance: user.totalDistance || 0,
          createdAt: user.createdAt
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data received" });
    }
  } catch (error) {
    console.error("BACKEND REGISTRATION ERROR: ", error);
    res.status(500).json({
      message: "server error during registration",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    const isPasswordMatch = user && user.password
        ? await bcrypt.compare(password, user.password)
        : false;
        
    if (user && isPasswordMatch) {
      // 🔴 THE FIX: Send the FULL profile back to React
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          bio: user.bio,
          totalRides: user.totalRides || 0,
          totalDistance: user.totalDistance || 0,
          createdAt: user.createdAt
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "invalid email or password" });
    }
  } catch (error) {
    console.error("BACKEND LOGIN ERROR: ", error);
    res.status(500).json({ message: "server error during login", error: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private (Logged In)
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "You must provide both old and new passwords." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "The old password you entered is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password successfully updated." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server error while changing password." });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: "This email is already in use by another account." });
      }
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.bio !== undefined) {
      user.bio = req.body.bio;
    }

    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }

    const updatedUser = await user.save();

    // 🔴 Ensure updateProfile also returns everything so Context updates properly
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      totalRides: updatedUser.totalRides || 0,
      totalDistance: updatedUser.totalDistance || 0,
      createdAt: updatedUser.createdAt,
      message: "Profile successfully updated."
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  }
};



// @desc    Get user profile data (Fresh fetch)
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        totalRides: user.totalRides || 0,
        totalDistance: user.totalDistance || 0,
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
};



// @desc    Forgot Password - Generates token and sends email
// @route   POST /api/users/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
    }

    // 1. Generate a random raw token for the URL
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash the token and save it to the database for security
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Expires in exactly 10 minutes

    await user.save({ validateBeforeSave: false });

    // 3. Construct the reset URL pointing to your React frontend
    // Change localhost:5173 to whatever port your React app runs on
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) requested a password reset for your account.\n\nPlease click the following link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message: message,
      });

      return res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
    } catch (emailError) {
      // If the email fails, destroy the token in the DB so it isn't left hanging
      console.error("Email Error:", emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// @desc    Reset Password - Verifies token and saves new password
// @route   PUT /api/users/resetpassword/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    // 1. Re-hash the token from the URL so we can compare it to the DB
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // 2. Find user with that exact token AND ensure it hasn't expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // 3. Set the new password. The Mongoose 'pre-save' hook we built earlier will automatically hash this.
    user.password = req.body.password;
    
    // 4. Destroy the token fields so they can't be used again
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};