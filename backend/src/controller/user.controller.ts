import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class UserController {
    static async GetProfile(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const user = await prisma.user.findUnique(
                {
                    where: {
                        userId: userId
                    }
                }
            )
            res.json(user);
        } catch (err) {
            next(err)
        }
    }
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await prisma.user.findMany();
            res.json(users);
        } catch (err) {
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