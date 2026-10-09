import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/dashboard', protect, getAnalytics);

export default router;
