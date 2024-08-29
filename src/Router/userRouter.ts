import { Router, Request, Response, NextFunction } from 'express';
import User, { IUser, UserRole } from "../Model/User"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import validator from 'validator';
import crypto from 'crypto'
import nodemailer from 'nodemailer' 
// import { sendSms } from '../Helper/sendSMS';
import { sendEmail } from '../Helper/sendEmail';
import { verifyToken } from '../Helper/verifyToken';
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const SERVER = process.env.SERVER || "http://localhost:3000/";

const generateToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

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

    // Validate phone number
    if (!validator.isMobilePhone(phoneNumber, 'any', { strictMode: false })) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Check for existing user by email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email or username already exists' });
    }

    const saltRound = 10;
    const secPassword = await bcrypt.hash(password, saltRound);

    // Create and save the new user
    let newUser: IUser;

    if (role === 'civilian') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

      // Send OTP via SMS (You need to implement sendSms function)
      // await sendSms(phoneNumber, `Your OTP is ${otp}`)
      //   .then(() => console.log('OTP sent'))
      //   .catch((error) => console.error('Failed to send OTP', error));

      newUser = new User({ username, email, password: secPassword, phoneNumber, role, verified: false, otp });
    } else {
      // For police, ambulance, and fire_fighter roles, only admin verification is needed
      newUser = new User({ username, email, password: secPassword, phoneNumber, role, verified: false });
    }

    // Send SMS after validating the phone number
    // await sendSms(phoneNumber, 'Hello, this is a test message from huzaifa!')
    //   .then(() => console.log('SMS sent'))
    //   .catch((error) => console.error('Failed to send SMS', error));

    await newUser.save();
    res.status(201).json({ message: `Account Created` });
  } catch (error: any) {
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

////////////////////////////////////////////////////////////
///////////// Additional route for OTP verification/////////

router.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, otp } = req.body;

    // Find user by username and OTP
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username OR email' });
    }
    const isMatch = await otp === user.otp;
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark the user as verified
    user.verified = true;
    user.otp = undefined; // Clear OTP after verification
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET);

    // Respond with the token
    res.status(200).json({ message: 'OTP verified, account activated', token });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    next(error);
  }
});

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

    if (!user.verified) {
      return res.status(400).json({ message: 'Account not verified. Please verify your account first' });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email/username or password' });
    }

    // Generate JWT token (if you're using JWT for sessions)
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, // Payload
      process.env.JWT_SECRET!
    );

    // Send success response with the token
    res.status(200).json({
      message: 'Login successful',
      token,
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

////////////////////////////////////////////////////////////////////////
////////////////////////// Forget Password ///////////////////////////////

router.post('/reset-password-request', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const resetToken = generateToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000 * 8); // 8 hours expiry
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${SERVER}?token=${resetToken}&email=${email}`;
    const subject = 'Password Reset Request';
    const text = `You requested a password reset. Click on the following link to reset your password: ${resetLink}`;
    const html = `<p>You requested a password reset. Click on the following link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`;

    await sendEmail(email, subject, text, html);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error: any) {
    console.error('Error processing password reset request:', error);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    next(error);
  }
});

/////////////////////////////////////////////////////////////
/////////////////// Reset Password //////////////////////////
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, email, password } = req.body;

    // Validate inputs
    if (!token || !email || !password) {
      return res.status(400).json({ message: 'Token, email, and new password are required' });
    }

    // Find the user by email and reset token
    const user = await User.findOne({ email, resetPasswordToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or email' });
    }
    if (!user.resetPasswordExpiry) {
      return res.status(400).json({message: "No Expiry date"})
    }
    // Check if the token has expired
    if (Date.now() > user.resetPasswordExpiry.getTime()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Hash the new password
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    // Update the user's password and clear the reset token and expiry
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    next(error);
  }
});

export default router;
