import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { supabase, isSupabaseConfigured } from "../config/supabase.config";

export class ProjectController {
    // CREATE
    static async createProject(req: Request, res: Response, next: NextFunction) {
        try {
            const { 
                projectName, 
                techStack, 
                projectDescription, 
                liveDemo, 
                gitRepo, 
                duration, 
                cost, 
                category
            } = req.body;

            if (!projectName || !techStack || !category) {
                return next({ status: 400, message: "Required fields missing" });
            }

            const files = req.files as Express.Multer.File[];
            const imageUrls: string[] = [];

            // Upload multiple images to Supabase if configured
            if (files && files.length > 0) {
                if (isSupabaseConfigured() && supabase) {
                    let count=0
                    for (const file of files) {
                         const fileName = `${Date.now()}-${projectName}(${count})`;
                        
                        const { data, error } = await supabase.storage
                            .from('Sancilo')
                            .upload(fileName, file.buffer, {
                                contentType: file.mimetype
                            });

                        if (error) {
                            console.error('Supabase upload error:', error);
                            return next({ status: 500, message: `Image upload failed: ${error.message}` });
                        }

                        const { data: { publicUrl } } = supabase.storage
                            .from('Sancilo')
                            .getPublicUrl(fileName);

                        imageUrls.push(publicUrl);
                        count+=1;
                        console.log(imageUrls)
                    }
                } else {
                    // Skip image upload if Supabase not configured
                    console.log('Supabase not configured, skipping image upload');
                }
            }

            const newProject = await prisma.project.create({
                data: {
                    projectName,
                    techStack: Array.isArray(techStack) ? techStack : [techStack],
                    projectDescription,
                    projectThumbnail: imageUrls,
                    liveDemo,
                    gitRepo,
                    duration,
                    cost: cost ? parseInt(cost) : null,
                    category
                }
            });

            res.json(newProject);
        } catch (err) {
            next(err);
        }
    }

    // READ ALL
    static async getAllProjects(req: Request, res: Response, next: NextFunction) {
        try {
            const projects = await prisma.project.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json(projects);
        } catch (err) {
            next(err);
        }
    }

    // READ ONE
    static async getProjectById(req: Request, res: Response, next: NextFunction) {
        try {
            const projectId = req.params.id as string;
            const project = await prisma.project.findUnique({
                where: { projectId }
            });
            
            if (!project) {
                return next({ status: 404, message: "Project not found" });
            }
            
            res.json(project);
        } catch (err) {
            next(err);
        }
    }

    // UPDATE
    static async updateProject(req: Request, res: Response, next: NextFunction) {
        try {
            const projectId = req.params.id as string;
            const { 
                projectName, 
                techStack, 
                projectDescription, 
                liveDemo, 
                gitRepo, 
                duration, 
                cost, 
                category
            } = req.body;

            const files = req.files as Express.Multer.File[];
            let imageUrls: string[] = [];

            // Upload new images if provided and Supabase is configured
            if (files && files.length > 0) {
                if (isSupabaseConfigured() && supabase) {
                    for (const file of files) {
                        const fileName = `${Date.now()}-${file.originalname}`;
                        
                        const { data, error } = await supabase.storage
                            .from('Sancilo')
                            .upload(fileName, file.buffer, {
                                contentType: file.mimetype
                            });

                        if (error) {
                            console.error('Supabase upload error:', error);
                            return next({ status: 500, message: `Image upload failed: ${error.message}` });
                        }

                        const { data: { publicUrl } } = supabase.storage
                            .from('Sancilo')
                            .getPublicUrl(fileName);

                        imageUrls.push(publicUrl);
                    }
                }
            }

            const updateData: any = {
                projectName,
                techStack: Array.isArray(techStack) ? techStack : [techStack],
                projectDescription,
                liveDemo,
                gitRepo,
                duration,
                cost: cost ? parseInt(cost) : null,
                category
            };

            // Only update images if new ones are uploaded
            if (imageUrls.length > 0) {
                updateData.projectThumbnail = imageUrls;
            }

            const updatedProject = await prisma.project.update({
                where: { projectId },
                data: updateData
            });

            res.json(updatedProject);
        } catch (err) {
            next(err);
        }
    }

    

    // DELETE
    static async deleteProject(req: Request, res: Response, next: NextFunction) {
        try {
            const projectId = req.params.id as string;
            
            await prisma.project.delete({
                where: { projectId }
            });

            res.json({ message: "Project deleted successfully" });
        } catch (err) {
            next(err);
        }
    }
    // ADD IMAGES TO PROJECT
    static async addProjectImages(req: Request, res: Response, next: NextFunction) {
        try {
            const projectId = req.params.id as string;
            const files = req.files as Express.Multer.File[];
            
            if (!files || files.length === 0) {
                return next({ status: 400, message: "No images provided" });
            }

            const project = await prisma.project.findUnique({ where: { projectId } });
            if (!project) {
                return next({ status: 404, message: "Project not found" });
            }

            const newImageUrls: string[] = [];

            if (isSupabaseConfigured() && supabase) {
                let count=0;
                for (const file of files) {
                    
                    const fileName = `${Date.now()}-${project.projectName}(${count})`;
                    
                    const { error } = await supabase.storage
                        .from('Sancilo')
                        .upload(fileName, file.buffer, { contentType: file.mimetype });

                    if (error) {
                        return next({ status: 500, message: "Image upload failed" });
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('Sancilo')
                        .getPublicUrl(fileName);

                    newImageUrls.push(publicUrl);
                    count+=1;
                }
            }

            const updatedProject = await prisma.project.update({
                where: { projectId },
                data: {
                    projectThumbnail: [...(project.projectThumbnail || []), ...newImageUrls]
                }
            });
        
            res.json(updatedProject);
        } catch (err) {
            next(err);
        }
    }

    // REMOVE IMAGE FROM PROJECT
    static async removeProjectImage(req: Request, res: Response, next: NextFunction) {
        try {
            const projectId = req.params.id as string;
            const { imageUrl } = req.body;

            if (!imageUrl) {
                return next({ status: 400, message: "Image URL required" });
            }

            const project = await prisma.project.findUnique({ where: { projectId } });
            if (!project) {
                return next({ status: 404, message: "Project not found" });
            }

            const updatedImages = (project.projectThumbnail || []).filter(
                (url: string) => url !== imageUrl
            );

            const updatedProject = await prisma.project.update({
                where: { projectId },
                data: { projectThumbnail: updatedImages }
            });

            res.json(updatedProject);
        } catch (err) {
            next(err);
        }
    }
}