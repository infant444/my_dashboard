import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, UserType } from "../model/user.model";
import { prisma } from "../lib/prisma";
import { generatePassword } from "../services/passcode.services";
import { EmailServices } from "../services/email.services";

export class AuthController {

  // ✅ CREATE USER
  static async CreateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { full_name, email, phone, role, position } = req.body;
      console.log(email)
      if (!full_name || !email) {
        return next({ status: 400, message: "Required fields missing" });
      }
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return next({ status: 409, message: "User already exists" });
      }
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          fullName: full_name,
          email,
          password: hashedPassword,
          role: role ?? 'staff',
          phone: phone || null,
          position:position,
          firstLogin: true
        },
        select: {
          userId: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });
      // Send registration email with credentials
      const userData: User = {
        user_id: newUser.userId,
        full_name: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone ?? "",
        password: "",
        role: newUser.role,
        is_active: newUser.isActive,
      };
      await EmailServices.registerEmail(password, userData);
      res.json(newUser);
    } catch (err) {
      next(err);
    }
  }

  // 🔐 LOGIN
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next({ status: 400, message: "Email and password required" });
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return next({ status: 404, message: "User does not exist" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return next({ status: 401, message: "Password mismatch" });
      }

      const updatedUser = await prisma.user.update({
        where: { userId: user.userId },
        data: { isActive: true }
      });

      const userData: User = {
        user_id: updatedUser.userId,
        full_name: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
        password: updatedUser.password,
        role: updatedUser.role,
        is_active: updatedUser.isActive,
        first_login: updatedUser.firstLogin
      };

      res.json(generateUserToken(userData));
    } catch (error) {
      next(error);
    }
  }

  // 🔁 UPDATE PASSWORD
  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id, password, new_password } = req.body;

      if (!user_id || !password || !new_password) {
        return next({ status: 400, message: "Missing fields" });
      }

      const user = await prisma.user.findUnique({ where: { userId: user_id } });

      if (!user) {
        return next({ status: 404, message: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return next({ status: 401, message: "Old password mismatch" });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);

      await prisma.user.update({
        where: { userId: user_id },
        data: { password: hashedPassword, firstLogin: false }
      });

      res.json({ status: 200, message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  }
  static async resetPassword(req:Request,res:Response,next:NextFunction){
    try{
      const user_id = req.params.userid as string;
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);
      const user=await prisma.user.update({
        where: { userId: user_id },
        data: { password: hashedPassword, firstLogin: true },
               select: {
          userId: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });
          const userData: User = {
        user_id:user.userId,
        full_name:user.fullName,
        email:user.email,
        phone:user.phone ?? "",
        password: "",
        role:user.role,
        is_active:user.isActive
      };
      await EmailServices.resetPasswordEmail(password, userData);
      res.json({ status: 200, message: "Password updated successfully" });
    }catch(err){
      next(err);
    }
  }

  // 🚪 LOGOUT
  static async logout(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      // console.log(userId)
      await prisma.user.update({
        where: { userId },
        data: { isActive: false }
      });

      res.json({ status: 200, message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  }
}

// 🔐 TOKEN GENERATOR
const generateUserToken = (user: User) => {
  if (!process.env.JWT_USER_AUTH) {
    throw new Error("JWT_USER_AUTH not configured");
  }

  const token = jwt.sign(
    { id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_USER_AUTH,
    { expiresIn: "7d" }
  );

  return {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_active: user.is_active,
    first_login: user.first_login,
    token
  };
};
