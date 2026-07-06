import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Create a new competition (Teachers only)
 */
export const createCompetition = async (req: AuthRequest, res: Response) => {
    try {
        const { title_ar, title_en, description_ar, description_en, start_date, end_date, image_url, xp_reward } = req.body;
        const userId = req.user?.id;

        const teacher = await prisma.teacher.findUnique({ where: { user_id: userId } });
        if (!teacher) return res.status(403).json({ message: 'Only teachers can create competitions.' });

        const competition = await prisma.competition.create({
            data: {
                title_ar,
                title_en,
                description_ar,
                description_en,
                start_date: start_date ? new Date(start_date) : new Date(),
                end_date: new Date(end_date),
                image_url,
                xp_reward: parseInt(xp_reward) || 500,
                teacher_id: teacher.id,
                status: 'UPCOMING'
            }
        });

        res.status(201).json(competition);
    } catch (error) {
        console.error('Create Competition Error:', error);
        res.status(500).json({ message: 'Error creating competition.' });
    }
};

/**
 * Get all competitions
 */
export const getCompetitions = async (req: AuthRequest, res: Response) => {
    try {
        const competitions = await prisma.competition.findMany({
            include: {
                teacher: {
                    include: { user: { select: { first_name: true, last_name: true, avatar_url: true } } }
                },
                _count: { select: { participants: true } }
            },
            orderBy: { start_date: 'desc' }
        });

        res.json(competitions);
    } catch (error) {
        console.error('Get Competitions Error:', error);
        res.status(500).json({ message: 'Error fetching competitions.' });
    }
};

/**
 * Get a single competition with participants
 */
export const getCompetitionById = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const competition = await prisma.competition.findUnique({
            where: { id },
            include: {
                teacher: {
                    include: { user: { select: { first_name: true, last_name: true } } }
                },
                participants: {
                    include: {
                        student: {
                            include: { user: { select: { first_name: true, last_name: true, avatar_url: true } } }
                        }
                    },
                    orderBy: { score: 'desc' }
                }
            }
        });

        if (!competition) return res.status(404).json({ message: 'Competition not found.' });
        res.json(competition);
    } catch (error) {
        console.error('Get Competition Info Error:', error);
        res.status(500).json({ message: 'Error fetching competition details.' });
    }
};

/**
 * Update a competition
 */
export const updateCompetition = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title_ar, title_en, description_ar, description_en, start_date, end_date, image_url, xp_reward, status } = req.body;
        const userId = req.user?.id;

        const teacher = await prisma.teacher.findUnique({ where: { user_id: userId } });
        const competition = await prisma.competition.findUnique({ where: { id } });

        if (!competition) return res.status(404).json({ message: 'Competition not found.' });
        if (competition.teacher_id !== teacher?.id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to update this competition.' });
        }

        const updated = await prisma.competition.update({
            where: { id },
            data: {
                title_ar,
                title_en,
                description_ar,
                description_en,
                start_date: start_date ? new Date(start_date) : undefined,
                end_date: end_date ? new Date(end_date) : undefined,
                image_url,
                xp_reward: xp_reward ? parseInt(xp_reward) : undefined,
                status
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update Competition Error:', error);
        res.status(500).json({ message: 'Error updating competition.' });
    }
};

/**
 * Delete a competition
 */
export const deleteCompetition = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.id;

        const teacher = await prisma.teacher.findUnique({ where: { user_id: userId } });
        const competition = await prisma.competition.findUnique({ where: { id } });

        if (!competition) return res.status(404).json({ message: 'Competition not found.' });
        if (competition.teacher_id !== teacher?.id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this competition.' });
        }

        await prisma.competition.delete({ where: { id } });
        res.json({ message: 'Competition deleted successfully.' });
    } catch (error) {
        console.error('Delete Competition Error:', error);
        res.status(500).json({ message: 'Error deleting competition.' });
    }
};

/**
 * Join a competition (Students only)
 */
export const joinCompetition = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.id;

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) return res.status(403).json({ message: 'Only students can join competitions.' });

        const competition = await prisma.competition.findUnique({ where: { id } });
        if (!competition) return res.status(404).json({ message: 'Competition not found.' });

        if (competition.status === 'FINISHED') return res.status(400).json({ message: 'Competition has already finished.' });

        const participant = await prisma.competitionParticipant.create({
            data: {
                competition_id: id,
                student_id: student.id
            }
        });

        res.status(201).json(participant);
    } catch (error: any) {
        if (error.code === 'P2002') return res.status(400).json({ message: 'You have already joined this competition.' });
        console.error('Join Competition Error:', error);
        res.status(500).json({ message: 'Error joining competition.' });
    }
};
