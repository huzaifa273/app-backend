import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any; // You can define a more specifics type if you have a user interface
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['token'] as string; // Explicitly define the type

  if (authHeader) {
    jwt.verify(authHeader, process.env.JWT_SECRET as string, (err, user) => {
      if (err) {
        return res.status(400).json("Access Token not valid");
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(400).json("Access Token not available");
  }
};

export { verifyToken };
