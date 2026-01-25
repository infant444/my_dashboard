import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { EmailServices } from "../services/email.services";

export class FeedbackController{
    static async createFeedback(req:Request,res:Response,next:NextFunction){
        try{
            const{name,email,rating,message,type}=req.body;
            const newFeedback= await prisma.feedback.create({
                data:{
                    name:name,
                    email:email,
                    rating:rating,
                    message:message,
                    type:type
                }
            });
            res.json(newFeedback);
        }catch(err){
            next(err);
        }
    }
    static async getAllFeedback(req:Request,res:Response,next:NextFunction){
        try {
            // Your logic to get all feedback
            const feedback= await prisma.feedback.findMany();
            res.json(feedback);
        }catch(err){
            next(err)
        }
    }
    static async getFeedbackById(req:Request,res:Response,next:NextFunction){
        try {
            // Your logic to get feedback By id
            const feedbackId = req.params.feedback_id as string;
            const feedback= await prisma.feedback.findUnique({
                where:{id:feedbackId}
            });
            res.json(feedback);
        }catch(err){
            next(err)
        }
    }
    static async updateFeedback(req:Request,res:Response,next:NextFunction){
        try{
            const feedbackId = req.params.feedback_id as string;
            const { name, email, rating, message, type } = req.body;
            const updatedFeedback = await prisma.feedback.update({
                where: { id: feedbackId },
                data: {
                    name: name,
                    email: email,
                    rating: rating,
                    message: message,
                    type: type
                }   
            })
           
            res.json(updatedFeedback);
        }catch(err){
            next(err)
        }
    }
    static async deleteFeedback(req:Request, res:Response, next:NextFunction){
        try{
            const feedbackId = req.params.feedback_id as string;
            await prisma.feedback.delete({
                where: { id: feedbackId },
            });
            res.json({message:"Feedback deleted successfully"});
        }catch(err){
            next(err)
        }
    }
}