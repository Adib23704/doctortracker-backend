import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { type IUser, User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
}

export const protect = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication required. No authorization token provided.', 401);
    }

    try {
      const secret = process.env.JWT_SECRET || 'doctor_tracker_jwt_secret_dev_key_2026_secure';
      const decoded = jwt.verify(token, secret) as JwtPayload;

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        throw new AppError('User belonging to this token no longer exists.', 401);
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Invalid or expired authentication token.', 401);
    }
  }
);
