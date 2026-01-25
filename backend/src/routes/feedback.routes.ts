import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import authMiddleware from '../middleware/auth.middleware';
import { FeedbackController } from '../controller/feedback.controller';

const router = Router();

router.use(authMiddleware);
// CREATE FEEDBACK - POST /feedbacks
router.post('/', asyncHandler(FeedbackController.createFeedback));

// GET ALL FEEDBACK - GET /feedbacks

router.get('/', asyncHandler(FeedbackController.getAllFeedback));

// GET FEEDBACK BY ID - GET /feedbacks/:feedback_id
router.get('/:feedback_id', asyncHandler(FeedbackController.getFeedbackById));
// update FEEDBACK BY ID - PUT /feedbacks/:feedback_id
router.put('/:feedback_id', asyncHandler(FeedbackController.updateFeedback));

// DELETE FEEDBACK - DELETE /feedbacks/:feedback_id
router.delete('/:feedback_id', asyncHandler(FeedbackController.deleteFeedback));

export default router;
