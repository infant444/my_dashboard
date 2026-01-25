import {Router} from 'express'
import asyncHandler from 'express-async-handler';
import {EnquiryController} from '../controller/enquiry.controller'
import authMiddleware from '../middleware/auth.middleware';
const router = Router();
router.use(authMiddleware);
// GET ALL ENQUIRY - GET /enquiries
router.get('/', asyncHandler(EnquiryController.getall));
// SEND RESPONSE TO ENQUIRY - POST /enquiries/respond/:enquiry_id
router.post('/respond/:enquiry_id', asyncHandler(EnquiryController.SendRespones));
// DELETE ENQUIRY - DELETE /enquiries/:enquiry_id
router.delete('/:enquiry_id', asyncHandler(EnquiryController.deleteEnquiry));
export default router;