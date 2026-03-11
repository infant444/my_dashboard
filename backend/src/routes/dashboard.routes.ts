import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { DashboardController } from '../controller/dashboard.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// GET /dashboard/stats
router.get('/stats', asyncHandler(DashboardController.getStats));

export default router;
