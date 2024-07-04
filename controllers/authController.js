import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';
import { sendEmail } from '../utils/sendEmail.js';

let otpStorage = {}; // In-memory storage for OTPs (can be replaced with a better solution

// Register User
export const registerUser = async (req, res) => {
  try {
    console.log(req.body);
    const { username, email, password, phone } = req.body;
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userCreated = await User.create({
      username,
      email,
      phone,
      password,
    });

    const token = await userCreated.generateToken();

    // Send confirmation email
    const subject = "Welcome to Our App!";
    const message = `
      <p>Dear ${username},</p>
      <p>Thank you for registering with our app.</p>
      <p>Enjoy using our services!</p>
    `;
    await sendEmail(subject, message, email, process.env.EMAIL_USER, process.env.EMAIL_USER);

    res.status(201).json({
      msg: "Registration successful. Confirmation email sent.",
      token,
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login User
// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    const userExist = await User.findOne({ email });

    if (!userExist) {
      console.log(`User with email ${email} does not exist.`);
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    console.log(`User found: ${userExist}`);

    const isPasswordCorrect = await bcrypt.compare(password, userExist.password);
    console.log(`Password comparison result: ${isPasswordCorrect}`);

    if (isPasswordCorrect) {
      const token = await userExist.generateToken();
      res.status(200).json({
        msg: "Login Successful",
        token,
        userId: userExist._id.toString(),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json("internal server error");
  }
};


// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from route parameters
    const { username, email, phone } = req.body; // Get updated user data from request body

    // Update user details in the database
    await User.findByIdAndUpdate(userId, { username, email, phone });

    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from route parameters

    // Delete user from the database
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get User
export const getUser = async (req, res) => {
  try {
    const userData = req.user;
    console.log(userData);
    return res.status(200).json({ userData });
  } catch (error) {
    console.log(`error from the user route ${error}`);
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist." });
    }

    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const otpExpiry = Date.now() + 3600000; // OTP valid for 1 hour

    // Store OTP and expiry in memory
    otpStorage[email] = { otp, otpExpiry };

    // Send OTP to user's email
    const subject = "Password Reset OTP";
    const message = `
      <p>Your OTP for password reset is: ${otp}</p>
      <p>This OTP is valid for 1 hour.</p>
    `;
    await sendEmail(subject, message, email, process.env.EMAIL_USER, process.env.EMAIL_USER);

    res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const storedOtpData = otpStorage[email];

    if (!storedOtpData) {
      return res.status(400).json({ message: "OTP not found or expired." });
    }

    const { otp: storedOtp, otpExpiry } = storedOtpData;

    if (otp !== storedOtp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (Date.now() > otpExpiry) {
      delete otpStorage[email];
      return res.status(400).json({ message: "OTP has expired." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    user.password = newPassword;
    await user.save();

    delete otpStorage[email]; // Clear OTP after successful password reset

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};