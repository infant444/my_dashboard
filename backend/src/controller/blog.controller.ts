import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { supabase, isSupabaseConfigured } from "../config/supabase.config";
import * as fs from 'fs';
import * as path from 'path';

export class BlogController {
    static async create(req: any, res: Response, next: NextFunction) {
        try {
            const { title, content, slug, excerpt, publishDate, readTime, category, author, tags } = req.body;
            const file = req.file as Express.Multer.File;
            const authorId = req.user.id;
            
            let imageUrl: string | null = null;

            if (file) {
                if (isSupabaseConfigured() && supabase) {
                    const fileName = `${Date.now()}-${file.originalname}`;
                    try {
                        const { data, error } = await supabase.storage
                            .from('Sancilo')
                            .upload(fileName, file.buffer, {
                                contentType: file.mimetype
                            });

                        if (error) throw error;
                        
                        const { data: { publicUrl } } = supabase.storage
                            .from('Sancilo')
                            .getPublicUrl(fileName);

                        imageUrl = publicUrl;
                    } catch (uploadError: any) {
                        console.warn('Supabase failed, using local storage');
                        const uploadsDir = path.join(__dirname, '../../uploads');
                        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                        const filePath = path.join(uploadsDir, fileName);
                        fs.writeFileSync(filePath, file.buffer);
                        imageUrl = `/uploads/${fileName}`;
                    }
                } else {
                    const uploadsDir = path.join(__dirname, '../../uploads');
                    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                    const fileName = `${Date.now()}-${file.originalname}`;
                    const filePath = path.join(uploadsDir, fileName);
                    fs.writeFileSync(filePath, file.buffer);
                    imageUrl = `/uploads/${fileName}`;
                }
            }

            const blog = await prisma.blog.create({
                data: {
                    title,
                    content,
                    slug,
                    excerpt,
                    publishDate: publishDate ? new Date(publishDate) : null,
                    readTime,
                    category,
                    author: author || req.user.name,
                    authorId,
                    tags: tags ? tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
                    image: imageUrl
                }
            })
            res.json(blog);
        } catch (error) {
            next(error)
        }
    }
    static async getAllBlog(req: any, res: Response, next: NextFunction) {
        try {
            const userRole = req.user.role;
            const userId = req.user.id;
            
            let blogs;
                blogs = await prisma.blog.findMany({
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
    static async updateBlog(req: any, res: Response, next: NextFunction) {
        try {
            const blogId = req.params.id as string;
            const { title, content, slug, excerpt, publishDate, readTime, category, tags } = req.body;
            const file = req.file as Express.Multer.File;
            const userRole = req.user.role;
            const userId = req.user.id;

            // Check if user can edit this blog
            if (userRole !== 'superAdmin') {
                const blog = await prisma.blog.findUnique({ where: { blogId } });
                if (!blog || blog.authorId !== userId) {
                    return next({ status: 403, message: "Not authorized to edit this blog" });
                }
            }

            const updateData: any = {
                title,
                content,
                slug,
                excerpt,
                publishDate: publishDate ? new Date(publishDate) : null,
                readTime,
                category,
                tags: tags ? tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : undefined,
            };

            if (file) {
                if (isSupabaseConfigured() && supabase) {
                    const fileName = `${Date.now()}-${file.originalname}`;
                    try {
                        const { data, error } = await supabase.storage
                            .from('Sancilo')
                            .upload(fileName, file.buffer, {
                                contentType: file.mimetype
                            });

                        if (error) throw error;

                        const { data: { publicUrl } } = supabase.storage
                            .from('Sancilo')
                            .getPublicUrl(fileName);

                        updateData.image = publicUrl;
                    } catch (uploadError: any) {
                        console.warn('Supabase failed, using local storage');
                        const uploadsDir = path.join(__dirname, '../../uploads');
                        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                        const filePath = path.join(uploadsDir, fileName);
                        fs.writeFileSync(filePath, file.buffer);
                        updateData.image = `/uploads/${fileName}`;
                    }
                } else {
                    const uploadsDir = path.join(__dirname, '../../uploads');
                    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                    const fileName = `${Date.now()}-${file.originalname}`;
                    const filePath = path.join(uploadsDir, fileName);
                    fs.writeFileSync(filePath, file.buffer);
                    updateData.image = `/uploads/${fileName}`;
                }
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