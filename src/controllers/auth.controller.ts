import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema } from '../validations/auth.validation.js';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'doctor_tracker_jwt_secret_dev_key_2026_secure';
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken(user._id.toString());

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated.', 401);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    },
  });
});
