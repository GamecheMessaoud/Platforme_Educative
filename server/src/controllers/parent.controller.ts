import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Get the children progress and stats for a parent
 */
export const getChildrenProgress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        const parent = await prisma.parent.findUnique({
            where: { user_id: userId },
            include: {
                children: {
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                                email: true,
                                avatar_url: true,
                            }
                        },
                        lesson_progress: {
                            include: {
                                lesson: {
                                    include: {
                                        course: true
                                    }
                                }
                            }
                        },
                        badges: {
                            include: {
                                badge: true
                            }
                        },
                        subscriptions: true
                    }
                }
            }
        });

        if (!parent) {
            res.status(404).json({ message: 'Parent profile not found.' });
            return;
        }

        // Format data to match dashboard needs
        const formattedChildren = parent.children.map(child => {
            const completedLessons = child.lesson_progress.filter(lp => lp.is_completed).length;
            const activeCourses = Array.from(new Set(child.lesson_progress.map(lp => lp.lesson.course.id))).length;

            return {
                id: child.id,
                name: `${child.user.first_name} ${child.user.last_name}`,
                email: child.user.email,
                avatar_url: child.user.avatar_url,
                total_xp: child.total_xp,
                current_level: child.current_level,
                current_streak: child.current_streak,
                completed_lessons: completedLessons,
                active_courses: activeCourses,
                subscription_status: child.subscription_status,
                badges: child.badges.map(b => b.badge.name_ar),
                recent_activity: child.lesson_progress
                    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
                    .slice(0, 5)
                    .map(lp => ({
                        lesson_name: lp.lesson.title_ar,
                        course_name: lp.lesson.course.title_ar,
                        xp_earned: lp.xp_earned,
                        date: lp.completed_at
                    }))
            };
        });

        res.json({ children: formattedChildren });
    } catch (error: any) {
        console.error('Get Children Progress Error:', error);
        res.status(500).json({ message: 'Error fetching children progress', error: error.message });
    }
};

/**
 * Link a student to a parent
 */
export const linkChild = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { studentEmail } = req.body;

        const parent = await prisma.parent.findUnique({
            where: { user_id: userId }
        });

        if (!parent) {
            res.status(404).json({ message: 'Parent profile not found.' });
            return;
        }

        const studentUser = await prisma.user.findUnique({
            where: { email: studentEmail },
            include: { studentProfile: true }
        });

        if (!studentUser || !studentUser.studentProfile) {
            res.status(404).json({ message: 'Student not found with this email.' });
            return;
        }

        // Link them
        await prisma.student.update({
            where: { id: studentUser.studentProfile.id },
            data: { parent_id: parent.id }
        });

        res.json({ message: 'Child linked successfully.' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error linking child', error: error.message });
    }
};
