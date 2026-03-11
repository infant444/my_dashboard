import {Router} from 'express'
import asyncHandler from 'express-async-handler';
import { UserController } from '../controller/user.controller'
import authMiddleware from '../middleware/auth.middleware';
const router = Router();
router.use(authMiddleware)
// GET USER PROFILE - GET /users/profile
router.get('/profile', asyncHandler(UserController.GetProfile));
// GET ALL USERS - GET /users
router.get("/all",asyncHandler(UserController.getAll));
// UPDATE USER - PUT /users/:user_id
router.put("/:user_id",asyncHandler(UserController.updateUser));
// DELETE USER - DELETE /users/:user_id
router.delete("/:user_id",asyncHandler(UserController.deleteUser));
export default router;