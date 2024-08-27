import { Router, Request, Response, NextFunction } from 'express';
import User, { IUser, UserRole } from "../Model/User"
const router = Router();

//////////////////////////////////////////////////////////////////////////////
/////////////////////////// Create a new user ////////////////////////////////
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, phoneNumber, role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    console.log({
      username, email, password, phoneNumber, role
    });
    
    const newUser: IUser = new User({ username, email, password, phoneNumber, role });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

/////////////////////////////////////////////////////////////////////////////
////////////////////////// Get all users ////////////////////////////////////

export default router;
