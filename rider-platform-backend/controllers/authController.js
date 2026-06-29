import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
export const registerUser = async (req, resp) => {
  try {
    const { name, email, password, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return resp.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
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
