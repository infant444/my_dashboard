import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { supabase, isSupabaseConfigured } from "../config/supabase.config";

export class BlogController {
    // static async create(req: any, res: Response, next: NextFunction) {
    //     try {
    //         const { title, content, slug, excerpt, publishDate, readTime, category, author, tags } = req.body;
    //         const file = req.file as Express.Multer.File;
    //         const authorId = req.user.id;
            
    //         console.log('File received:', file ? file.originalname : 'No file');
    //         console.log('Supabase configured:', isSupabaseConfigured());
            
    //         // Check if slug already exists
    //         const existingBlog = await prisma.blog.findUnique({ where: { slug } });
    //         if (existingBlog) {
    //             return next({ status: 400, message: "A blog with this slug already exists" });
    //         }
            
    //         let imageUrl: string | null = null;

    //         if (file) {
    //             if (isSupabaseConfigured() && supabase) {
    //                 const sanitizedFileName = file.originalname
    //                     .replace(/[^a-zA-Z0-9._-]/g, '_')
    //                     .replace(/_{2,}/g, '_');
    //                 const fileName = `${Date.now()}-${sanitizedFileName}`;
    //                 console.log('Attempting Supabase upload:', fileName);
                    
    //                 try {
    //                     const { data, error } = await supabase.storage
    //                         .from('Sancilo')
    //                         .upload(fileName, file.buffer, {
    //                             contentType: file.mimetype
    //                         });

    //                     if (error) throw error;
                        
    //                     const { data: { publicUrl } } = supabase.storage
    //                         .from('Sancilo')
    //                         .getPublicUrl(fileName);

    //                     imageUrl = publicUrl;
    //                     console.log('✅ Supabase upload successful:', imageUrl);
    //                 } catch (uploadError: any) {
    //                     console.warn('⚠️ Supabase upload failed, blog will be created without image:', uploadError.message);
    //                     imageUrl = null;
    //                 }
    //             } else {
    //                 console.warn('⚠️ Supabase not configured, blog will be created without image');
    //                 imageUrl = null;
    //             }
    //         }

    //         const blog = await prisma.blog.create({
    //             data: {
    //                 title,
    //                 content,
    //                 slug,
    //                 excerpt,
    //                 publishDate: publishDate ? new Date(publishDate) : null,
    //                 readTime,
    //                 category,
    //                 author: author || req.user.name,
    //                 authorId,
    //                 tags: tags ? tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
    //                 image: imageUrl
    //             }
    //         })
    //         res.json(blog);
    //     } catch (error) {
    //         next(error)
    //     }
    // }
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { title, content, slug, excerpt, publishDate, readTime, category, author } = req.body;
            const file = req.file as Express.Multer.File;
            
            if (!supabase) {
                return next({ status: 500, message: "Storage service not configured" });
            }
            
            const fileName = `${Date.now()}-${file.originalname}`;

            const { data, error } = await supabase!.storage
                .from('Sancilo')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype
                });

            if (error) {
                return next({ status: 500, message: "Image upload failed" });
            }
            const { data: { publicUrl } } = supabase!.storage
                .from('Sancilo')
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
    // static async updateBlog(req: any, res: Response, next: NextFunction) {
    //     try {
    //         const blogId = req.params.id as string;
    //         const { title, content, slug, excerpt, publishDate, readTime, category, tags } = req.body;
    //         const file = req.file as Express.Multer.File;
    //         const userRole = req.user.role;
    //         const userId = req.user.id;

    //         // Check if user can edit this blog
    //         if (userRole !== 'superAdmin') {
    //             const blog = await prisma.blog.findUnique({ where: { blogId } });
    //             if (!blog || blog.authorId !== userId) {
    //                 return next({ status: 403, message: "Not authorized to edit this blog" });
    //             }
    //         }

    //         const updateData: any = {
    //             title,
    //             content,
    //             slug,
    //             excerpt,
    //             publishDate: publishDate ? new Date(publishDate) : null,
    //             readTime,
    //             category,
    //             tags: tags ? tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : undefined,
    //         };

    //         if (file) {
    //             if (isSupabaseConfigured() && supabase) {
    //                 const sanitizedFileName = file.originalname
    //                     .replace(/[^a-zA-Z0-9._-]/g, '_')
    //                     .replace(/_{2,}/g, '_');
    //                 const fileName = `${Date.now()}-${sanitizedFileName}`;
                    
    //                 try {
    //                     const { data, error } = await supabase.storage
    //                         .from('Sancilo')
    //                         .upload(fileName, file.buffer, {
    //                             contentType: file.mimetype
    //                         });

    //                     if (error) throw error;

    //                     const { data: { publicUrl } } = supabase.storage
    //                         .from('Sancilo')
    //                         .getPublicUrl(fileName);

    //                     updateData.image = publicUrl;
    //                 } catch (uploadError: any) {
    //                     console.warn('⚠️ Supabase upload failed, blog will be updated without image:', uploadError.message);
    //                 }
    //             } else {
    //                 console.warn('⚠️ Supabase not configured, blog will be updated without image');
    //             }
    //         }

    //         const updatedBlog = await prisma.blog.update({
    //             where: { blogId },
    //             data: updateData
    //         });

    //         res.json(updatedBlog);
    //     } catch (err) {
    //         next(err);
    //     }
    // }
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
            if (file && supabase) {
                const fileName = `${Date.now()}-${file.originalname}`;

                const { data, error } = await supabase.storage
                    .from('Sancilo')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype
                    });

                if (error) {
                    console.log(error)
                    return next({ status: 500, message: "Image upload failed" });
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('Sancilo')
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