import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class UserController {
    static async GetProfile(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const user = await prisma.user.findUnique({
                where: {
                    userId: userId
                },
                select: {
                    userId: true,
                    email: true,
                    fullName: true,
                    role: true,
                    firstLogin: true,
                    phone: true,
                    position: true,
                    isActive: true
                }
            });
            
            if (!user) {
                return next({ status: 404, message: "User not found" });
            }

            res.json({
                user_id: user.userId,
                email: user.email,
                full_name: user.fullName,
                role: user.role,
                first_login: user.firstLogin,
                phone: user.phone,
                position: user.position,
                is_active: user.isActive
            });
        } catch (err) {
            next(err)
        }
    }
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    userId: true,
                    email: true,
                    fullName: true,
                    phone: true,
                    position: true,
                    role: true,
                    isActive: true,
                    firstLogin: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            console.log(users);
            res.json(users);
        } catch (err) {
            console.error('Get all users error:', err);
            next(err);
        }
    }
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.user_id as string;
            const { full_name, email, phone, position, role, is_active } = req.body;
            const updatedUser = await prisma.user.update({
                where: { userId: userId },
                data: {
                    fullName: full_name,
                    email: email,
                    phone: phone,
                    position: position,
                    role: role,
                    isActive: is_active
                }
            });
            res.send(updatedUser)
        } catch (err) {
            next(err)
        
        }
    }
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.user_id as string;
            await prisma.user.delete({
                where: { userId: userId },
            });
            res.json({ message: "User deleted successfully" });
        } catch (err) {
            next(err)
        }
    }
}