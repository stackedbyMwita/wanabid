import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const isSeller = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user.userType !== 'seller' && req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Seller access required' });
  }
  next();
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};