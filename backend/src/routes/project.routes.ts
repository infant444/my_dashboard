import { Router } from 'express';
import { ProjectController } from '../controller/project.controller';
import { uploadMultiple } from '../config/multer.config';
import asyncHandler from 'express-async-handler';
import authMiddleware from '../middleware/auth.middleware';
const router = Router();
router.use(authMiddleware);
// CREATE - POST /projects
router.post('/', uploadMultiple, asyncHandler(ProjectController.createProject));

// READ ALL - GET /projects
router.get('/', asyncHandler(ProjectController.getAllProjects));

// READ ONE - GET /projects/:id
router.get('/:id', asyncHandler(ProjectController.getProjectById));

// UPDATE - PUT /projects/:id
router.put('/:id', uploadMultiple,asyncHandler(ProjectController.updateProject));

// DELETE - DELETE /projects/:id
router.delete('/:id',asyncHandler(ProjectController.deleteProject));

export default router;