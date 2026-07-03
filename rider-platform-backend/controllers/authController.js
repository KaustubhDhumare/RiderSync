import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
export const registerUser = async (req, resp) => {
  try {
    const { name, email, password, phone, avatar } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return resp.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      avatar
    });

    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res
        .status(400)
        .json({ message: "Name must contain only letters." });
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Phone must be exactly 10 digits." });
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({
          message:
            "Password must be at least 8 chars, 1 uppercase, and 1 number.",
        });
    }

    if (user) {
      resp.status(201).json({
        uesr: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token: generateToken(user._id),
      });
    } else {
      resp.status(400).json({ message: "invalid user data received" });
    }
  } catch (error) {
    console.error("BACKEND REGISTRATION ERROR: ", error);
    resp.status(500).json({
      message: "server error during registration",
      error: error.message,
    });
  }
};

export const loginUser = async (req, resp) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    const isPasswordMatch =
      user && user.password
        ? await bcrypt.compare(password, user.password)
        : false;
    if (user && isPasswordMatch) {
      resp.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        },
        token: generateToken(user._id),
      });
    } else {
      resp.status(401).json({ message: "invalid email or password" });
    }
  } catch (error) {
    console.error("BACKEND LOGIN ERROR: ", error);
    resp
      .status(500)
      .json({ message: "server error during login", error: error.message });
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

    // 🔴 THE FIX: Use raw bcrypt to compare the strings instead of a custom model method
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "The old password you entered is incorrect." });
    }

    // Assign the plain text password directly. 
    // Your User.js pre('save') hook will automatically hash this.
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

    // If they are changing their email, check if it's already taken by someone else
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: "This email is already in use by another account." });
      }
    }

    // Update fields (fallback to existing if not provided)
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Bio can be empty, so we explicitly check if it was sent in the request body
    if (req.body.bio !== undefined) {
      user.bio = req.body.bio;
    }

    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      message: "Profile successfully updated."
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  }
};