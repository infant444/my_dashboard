
import { Router } from 'express';
import {uploadSingle} from '../config/multer.config';
import asyncHandler from 'express-async-handler';
import authMiddleware from '../middleware/auth.middleware';
import { BlogController } from '../controller/blog.controller';


const router = Router();

router.use(authMiddleware);

// CREATE - POST /blog
router.post('/', uploadSingle, asyncHandler(BlogController.create));

// READ ALL - GET /blog
router.get('/', asyncHandler(BlogController.getAllBlog));

// READ ONE - GET /blog/:id
router.get('/:id', asyncHandler(BlogController.getBlogById));

// UPDATE - PUT /blog/:id
router.put('/:id', uploadSingle, asyncHandler(BlogController.updateBlog));

// DELETE - DELETE /blog/:id
router.delete('/:id', asyncHandler(BlogController.deleteBlog));

export default router;