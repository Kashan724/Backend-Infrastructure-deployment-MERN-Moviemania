import express from 'express';
import { registerUser, loginUser, getAllUsers, updateUser, deleteUser, getUser, forgotPassword, resetPassword } from '../controllers/authController.js';
import { signupSchema, loginSchema } from '../validators/auth-validator.js';
import { validate } from '../middlewares/validator-middleware.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const router = express.Router();

// Register a new user
router.post("/register", validate(signupSchema), registerUser);

// Login existing user
router.post("/login", validate(loginSchema), loginUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

// Get all users
router.get('/users', getAllUsers);

// Update user route
router.put('/:id/update', updateUser);

// Delete user route
router.delete('/:id/delete', deleteUser);

// Get user details
router.get("/user", authMiddleware, getUser);

export default router;
