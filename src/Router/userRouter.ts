import { Router, Request, Response, NextFunction } from 'express';
import User, { IUser, UserRole } from "../Model/User"
const router = Router();

//////////////////////////////////////////////////////////////////////////////
/////////////////////////// Create a new user ////////////////////////////////
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, phoneNumber, role } = req.body;

    // Check if all required fields are provided
    if (!username || !email || !password || !phoneNumber || !role) {
      return res.status(400).json({ message: 'All fields are required: username, email, password, phoneNumber, role' });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: `Invalid role. Accepted roles are: ${Object.values(UserRole).join(', ')}` });
    }

    // Check for existing user by email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email or username already exists' });
    }

    // Create and save the new user
    const newUser: IUser = new User({ username, email, password, phoneNumber, role });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error:any) {
    console.error('Error creating user:', error);

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    } else if (error.code === 11000) { // Duplicate key error code
      return res.status(400).json({ message: 'Duplicate key error: A user with this username or email already exists' });
    }

    // Generic error message for unexpected errors
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    next(error);
  }
});


/////////////////////////////////////////////////////////////////////////////
////////////////////////// Get all users ////////////////////////////////////

export default router;
