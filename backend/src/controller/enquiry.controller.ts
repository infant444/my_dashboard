import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { EmailServices } from "../services/email.services";

export class EnquiryController {
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, phone, subject, message } = req.body;
            const enquiry = await prisma.enquiry.create({
                data: { name, email, phone, subject, message }
            });
            res.json(enquiry);
        } catch (err) {
            next(err);
        }
    }

    static async getall(req: Request, res: Response, next: NextFunction) {
        try {
            const Enquiry = await prisma.enquiry.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json(Enquiry);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const enquiryId = req.params.enquiry_id as string;
            const enquiry = await prisma.enquiry.findUnique({
                where: { id: enquiryId }
            });
            if (!enquiry) {
                return next({ status: 404, message: "Enquiry not found" });
            }
            res.json(enquiry);
        } catch (err) {
            next(err);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const enquiryId = req.params.enquiry_id as string;
            const { status, adminReply } = req.body;
            const enquiry = await prisma.enquiry.update({
                where: { id: enquiryId },
                data: { status, adminReply, repliedAt: new Date() }
            });
            res.json(enquiry);
        } catch (err) {
            next(err);
        }
    }
    static async SendRespones(req: Request, res: Response, next: NextFunction) {
        try {
            const enquiryId = req.params.enquiry_id as string;
            const { adminReply, subject } = req.body;
            const UpdateData = await prisma.enquiry.update({
                where: {
                    id: enquiryId
                },
                data: {
                    adminReply: adminReply
                }, select: {
                    name: true,
                    email: true,
                    adminReply: true
                }
            });
            await EmailServices.generateClientReplyEmail(UpdateData.name, adminReply, subject, UpdateData.email);

        } catch (err) {
            next(err);
        }
    }
    static async deleteEnquiry(req: Request, res: Response, next: NextFunction) {
        try {
            const enquiryId = req.params.enquiry_id as string;
            await prisma.enquiry.delete({
                where: { id: enquiryId },
            });
            res.json({ message: "Enquiry deleted successfully" });
        } catch (err) {
            next(err);
        }
    }
}