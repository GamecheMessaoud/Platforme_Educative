import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const globalSearch = async (req: Request, res: Response) => {
    try {
        const { q, type = 'all' } = req.query;
        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            return res.json({ courses: [], posts: [], users: [] });
        }

        const query = q.trim();
        let courses: any[] = [];
        let posts: any[] = [];
        let users: any[] = [];

        const searchPromises = [];

        // Search Courses
        if (type === 'all' || type === 'courses') {
            searchPromises.push(
                prisma.course.findMany({
                    where: {
                        is_published: true,
                        OR: [
                            { title_ar: { contains: query, mode: 'insensitive' } },
                            { title_fr: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 5,
                    select: { 
                        id: true, 
                        title_ar: true, 
                        title_fr: true, 
                        description: true, 
                        thumbnail_url: true, 
                        category: { select: { slug: true } } 
                    }
                }).then(result => { courses = result; })
            );
        }

        // Search Community Posts
        if (type === 'all' || type === 'posts') {
            searchPromises.push(
                prisma.communityPost.findMany({
                    where: {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { content: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 5,
                    select: { 
                        id: true, 
                        title: true, 
                        content: true, 
                        type: true, 
                        author: { 
                            include: { 
                                user: { select: { first_name: true, last_name: true, avatar_url: true } } 
                            } 
                        } 
                    }
                }).then(result => { posts = result; })
            );
        }

        // Search Users
        if (type === 'all' || type === 'users') {
            searchPromises.push(
                prisma.user.findMany({
                    where: {
                        is_active: true,
                        OR: [
                            { first_name: { contains: query, mode: 'insensitive' } },
                            { last_name: { contains: query, mode: 'insensitive' } },
                            { email: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 5,
                    select: { 
                        id: true, 
                        first_name: true, 
                        last_name: true, 
                        avatar_url: true, 
                        role: true 
                    }
                }).then(result => { users = result; })
            );
        }

        await Promise.all(searchPromises);

        res.json({ courses, posts, users });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error performing search' });
    }
};
