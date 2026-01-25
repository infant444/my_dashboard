import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { supabase } from "../config/supabase.config";

export class BlogController {
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { title, content, slug, excerpt, publishDate, readTime, category, author } = req.body;
            const file = req.file as Express.Multer.File;
            
            const fileName = `${Date.now()}-${file.originalname}`;

            const { data, error } = await supabase.storage
                .from('project-images')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype
                });

            if (error) {
                return next({ status: 500, message: "Image upload failed" });
            }
            const { data: { publicUrl } } = supabase.storage
                .from('project-images')
                .getPublicUrl(fileName);

            const imageUrl: string = publicUrl;

            const blog = await prisma.blog.create({

                data: {
                    title,
                    content,
                    slug,
                    excerpt,
                    publishDate,
                    readTime,
                    category,
                    author,
                    image: imageUrl

                }
            })
            res.json(blog);
        } catch (error) {
            next(error)
        }
    }
    static async getAllBlog(req: Request, res: Response, next: NextFunction) {
        try {
            const blogs = await prisma.blog.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json(blogs);
        } catch (err) {
            next(err);
        }
    }
    static async getBlogById(req:Request, res:Response, next:NextFunction){
        try {
             const blogId = req.params.id as string;
            const blog = await prisma.blog.findUnique({
                where: { blogId }
            });
            
            if (!blog) {
                return next({ status: 404, message: "Blog not found" });
            }
            
            res.json(blog);
        } catch (err) {
            next(err);
        }
    }
    static async deleteBlog(req:Request, res:Response, next:NextFunction){
        try {
             const blogId = req.params.id as string;
            
            await prisma.blog.delete({
                where: { blogId }
            });

            res.json({ message: "Blog deleted successfully" });
        } catch (err) {
            next(err);
        }
    }
    static async updateBlog(req: Request, res: Response, next: NextFunction) {
        try {
            const blogId = req.params.id as string;
            const { title, content, slug, excerpt, publishDate, readTime, category, author } = req.body;
            const file = req.file as Express.Multer.File;

            const updateData: any = {
                title,
                content,
                slug,
                excerpt,
                publishDate: publishDate ? new Date(publishDate) : null,
                readTime,
                category,
                author
            };

            // Only upload new image if file is provided
            if (file) {
                const fileName = `${Date.now()}-${file.originalname}`;

                const { data, error } = await supabase.storage
                    .from('project-images')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype
                    });

                if (error) {
                    return next({ status: 500, message: "Image upload failed" });
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('project-images')
                    .getPublicUrl(fileName);

                updateData.image = publicUrl;
            }

            const updatedBlog = await prisma.blog.update({
                where: { blogId },
                data: updateData
            });

            res.json(updatedBlog);
        } catch (err) {
            next(err);
        }
    }
}