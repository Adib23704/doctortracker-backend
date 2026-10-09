import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDashboardAnalytics } from '../services/analytics.service.js';

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const analyticsData = await getDashboardAnalytics();
  res.status(200).json({
    success: true,
    data: analyticsData,
  });
});
