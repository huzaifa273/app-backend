import { Router, Request, Response, NextFunction } from 'express';
import User, { IUser, UserRole } from "../Model/User"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
const router = Router();


////////////////////////////////////////////////////////////////////////
////////////////////////// Login users /////////////////////////////////
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, password } = req.body;

    // Check if both identifier and password are provided
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Both identifier (email or username) and password are required' });
    }

    // Find the user by email or username
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email/username or password' });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email/username or password' });
    }

    // Generate JWT token (if you're using JWT for sessions)
    // const token = jwt.sign(
    //   { id: user._id, role: user.role }, // Payload
    //   process.env.JWT_SECRET!
    // );

    // Send success response with the token
    res.status(200).json({
      message: 'Login successful',
      // token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Error logging in user:', error);

    // Handle unexpected errors
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    next(error);
  }
});

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
    const saltRound = 10;
    const secPassword = await bcrypt.hash(password, saltRound)
    console.log(secPassword);
    
    // Create and save the new user
    const newUser: IUser = new User({ username, email, password:secPassword, phoneNumber, role });
    await newUser.save();
    res.status(201).json({message: `Account Created`});
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


export default router;
