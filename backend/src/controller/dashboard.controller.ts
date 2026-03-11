import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class DashboardController {
    static async getStats(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            // Get counts
            const [
                totalBlogs,
                totalProjects,
                totalEnquiries,
                totalFeedback,
                totalUsers,
                recentBlogs,
                recentProjects,
                recentEnquiries,
                pendingEnquiries,
                activeFeedback
            ] = await Promise.all([
                // Total counts
                prisma.blog.count(),
                prisma.project.count(),
                prisma.enquiry.count(),
                prisma.feedback.count(),
                userRole === 'superAdmin' ? prisma.user.count() : Promise.resolve(0),

                // Recent items
                prisma.blog.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        blogId: true,
                        title: true,
                        category: true,
                        author: true,
                        createdAt: true,
                        image: true
                    }
                }),
                prisma.project.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        projectId: true,
                        projectName: true,
                        category: true,
                        createdAt: true,
                        projectThumbnail: true
                    }
                }),
                prisma.enquiry.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        subject: true,
                        status: true,
                        createdAt: true
                    }
                }),

                // Pending enquiries
                prisma.enquiry.count({
                    where: { status: 'pending' }
                }),

                // Active feedback
                prisma.feedback.count()
            ]);

            // Get blog stats by category
            const blogsByCategory = await prisma.blog.groupBy({
                by: ['category'],
                _count: {
                    category: true
                }
            });

            // Get project stats by category
            const projectsByCategory = await prisma.project.groupBy({
                by: ['category'],
                _count: {
                    category: true
                }
            });

            // Get enquiry stats by status
            const enquiriesByStatus = await prisma.enquiry.groupBy({
                by: ['status'],
                _count: {
                    status: true
                }
            });

            // Get monthly blog creation trend (last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const monthlyBlogs = await prisma.blog.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: {
                        gte: sixMonthsAgo
                    }
                },
                _count: {
                    blogId: true
                }
            });

            // Process monthly data
            const monthlyData = processMonthlyData(monthlyBlogs);

            res.json({
                stats: {
                    totalBlogs,
                    totalProjects,
                    totalEnquiries,
                    totalFeedback,
                    totalUsers,
                    pendingEnquiries,
                    activeFeedback
                },
                charts: {
                    blogsByCategory: blogsByCategory.map(item => ({
                        category: item.category,
                        count: item._count.category
                    })),
                    projectsByCategory: projectsByCategory.map(item => ({
                        category: item.category,
                        count: item._count.category
                    })),
                    enquiriesByStatus: enquiriesByStatus.map(item => ({
                        status: item.status,
                        count: item._count.status
                    })),
                    monthlyTrend: monthlyData
                },
                recent: {
                    blogs: recentBlogs,
                    projects: recentProjects,
                    enquiries: recentEnquiries
                }
            });
        } catch (err) {
            console.error('Dashboard stats error:', err);
            next(err);
        }
    }
}

function processMonthlyData(data: any[]) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCount: { [key: string]: number } = {};

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        monthlyCount[key] = 0;
    }

    // Count blogs per month
    data.forEach(item => {
        const date = new Date(item.createdAt);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (monthlyCount[key] !== undefined) {
            monthlyCount[key] += item._count.blogId;
        }
    });

    return Object.entries(monthlyCount).map(([month, count]) => ({
        month,
        count
    }));
}
