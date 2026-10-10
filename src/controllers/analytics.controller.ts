import type { Request, Response } from 'express';
import { getDashboardAnalytics } from '../services/analytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const analyticsData = await getDashboardAnalytics();
  res.status(200).json({
    success: true,
    data: analyticsData,
  });
});
