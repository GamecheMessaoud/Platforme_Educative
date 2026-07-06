import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { xpRequiredForLevel, calculateLevelFromXp, recalculateStudentLevel } from '../utils/gamification';

/**
 * Get stats for the currently logged-in student
 */
export const getGamificationStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const student = await prisma.student.findUnique({
            where: { user_id: userId },
            include: {
                badges: {
                    include: { badge: true }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }

        // Determine XP needed for next level using progressive formula
        const xpToNextLevel = xpRequiredForLevel(student.current_level + 1);

        // Fetch user's rank calculated by ordering all students by total_xp
        const rankResult = await prisma.$queryRaw`
            SELECT rank FROM (
                SELECT id, RANK() OVER (ORDER BY total_xp DESC) as rank
                FROM "Student"
            ) as ranked
            WHERE id = ${student.id}
        `;
        const rank = Array.isArray(rankResult) && rankResult.length > 0 ? Number((rankResult[0] as any).rank) : 0;

        // Count completed lessons
        const completedLessonsCount = await prisma.lessonProgress.count({
            where: {
                student_id: student.id,
                is_completed: true
            }
        });

        res.json({
            total_xp: student.total_xp,
            current_level: student.current_level,
            current_streak: student.current_streak,
            longest_streak: student.longest_streak,
            xp_to_next_level: xpToNextLevel,
            rank: rank,
            completed_lessons_count: completedLessonsCount,
            earned_badges: student.badges.map(sb => ({
                id: sb.badge.id,
                name: sb.badge.name_ar, // Default to Arabic for now
                name_en: sb.badge.name_en,
                name_fr: sb.badge.name_fr,
                description: sb.badge.description,
                icon: sb.badge.icon_url,
                date: sb.earned_at.toISOString().split('T')[0]
            }))
        });

    } catch (error) {
        console.error('Gamification Stats Error:', error);
        res.status(500).json({ message: 'Error retrieving stats.' });
    }
};

/**
 * Get Public Student Profile by Student ID
 */
export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = req.params.id as string;

        const studentData = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: {
                    select: { first_name: true, last_name: true, avatar_url: true }
                },
                badges: {
                    include: { badge: true }
                }
            }
        });

        if (!studentData) {
            res.status(404).json({ message: 'Student public profile not found.' });
            return;
        }

        const student: any = studentData; // bypass complex TS inference errors here

        // Calculate rank
        const rankResult = await prisma.$queryRaw`
            SELECT rank FROM (
                SELECT id, RANK() OVER (ORDER BY total_xp DESC) as rank
                FROM "Student"
            ) as ranked
            WHERE id = ${student.id}
        `;
        const rank = Array.isArray(rankResult) && rankResult.length > 0 ? Number((rankResult[0] as any).rank) : 0;

        // Count completed lessons
        const completedLessonsCount = await prisma.lessonProgress.count({
            where: {
                student_id: student.id,
                is_completed: true
            }
        });

        // Fetch recent public community posts
        const communityPosts = await prisma.communityPost.findMany({
            where: { author_id: student.id },
            orderBy: { created_at: 'desc' },
            take: 5
        });

        res.json({
            id: student.id,
            name: `${student.user.first_name} ${student.user.last_name}`,
            avatar: student.user.avatar_url,
            total_xp: student.total_xp,
            current_level: student.current_level,
            rank: rank,
            joined_at: student.created_at,
            completed_lessons_count: completedLessonsCount,
            badges: student.badges.map((sb: any) => ({
                id: sb.badge.id,
                name: sb.badge.name_ar,
                icon_url: sb.badge.icon_url,
                description: sb.badge.description,
            })),
            projects: communityPosts.map(p => ({
                id: p.id,
                title: p.title,
                type: p.type,
                created_at: p.created_at
            }))
        });

    } catch (error) {
        console.error('Public Profile Fetch Error:', error);
        res.status(500).json({ message: 'Error fetching public profile.' });
    }
};

/**
 * Get top students leaderboard
 */
export const getLeaderboard = async (req: AuthRequest, res: Response) => {
    try {
        const topStudents = await prisma.student.findMany({
            orderBy: { total_xp: 'desc' },
            take: 10,
            include: {
                user: {
                    select: { first_name: true, last_name: true, avatar_url: true }
                }
            }
        });

        const formattedLeaderboard = topStudents.map((s, index) => ({
            rank: index + 1,
            id: s.id,
            userId: s.user_id,
            name: `${s.user.first_name} ${s.user.last_name}`,
            avatar: s.user.avatar_url,
            xp: s.total_xp,
            level: s.current_level
        }));

        res.json(formattedLeaderboard);

    } catch (error) {
        console.error('Leaderboard Fetch Error:', error);
        res.status(500).json({ message: 'Error fetching leaderboard.' });
    }
};

/**
 * Record an XP transaction (awarding XP for completing a task)
 * Only accessible by TEACHERS, but we should still log who gave it.
 */
export const recordXpTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { student_id, amount, source, source_id } = req.body;
        const teacherUserId = req.user?.id;

        if (!student_id || !amount || !source) {
            return res.status(400).json({ message: 'Missing required fields: student_id, amount, source.' });
        }

        // Optional: Verify this teacher is allowed to award XP (e.g., they teach the student)
        // For now, roleMiddleware('TEACHER') handles the basic permission.

        const transaction = await prisma.$transaction(async (tx) => {
            const xpLog = await tx.xpTransaction.create({
                data: {
                    student_id,
                    amount: parseInt(amount),
                    source,
                    source_id
                }
            });

            await tx.student.update({
                where: { id: student_id },
                data: {
                    total_xp: { increment: parseInt(amount) }
                }
            });

            return { xpLog };
        });

        // Recalculate level with the progressive formula
        const { newLevel, leveledUp } = await recalculateStudentLevel(student_id);

        res.status(201).json({
            message: 'XP awarded successfully',
            xpAwarded: amount,
            newLevel,
            leveledUp
        });

    } catch (error) {
        console.error('XP Transaction Error:', error);
        res.status(500).json({ message: 'Error recording XP.' });
    }
};

/**
 * ADMIN: Migrate all student levels to the new progressive XP formula.
 * Formula: xpRequiredForLevel(n) = n^2 * 200
 * Recalculates and corrects EVERY student's current level (Option B).
 */
export const migrateAllStudentLevels = async (req: AuthRequest, res: Response) => {
    try {
        const students = await prisma.student.findMany({
            select: { id: true, total_xp: true, current_level: true }
        });

        let updated = 0;
        let skipped = 0;
        const results: { id: string; oldLevel: number; newLevel: number; totalXp: number }[] = [];

        for (const student of students) {
            const correctLevel = calculateLevelFromXp(student.total_xp);
            if (correctLevel !== student.current_level) {
                await prisma.student.update({
                    where: { id: student.id },
                    data: { current_level: correctLevel }
                });
                results.push({ id: student.id, oldLevel: student.current_level, newLevel: correctLevel, totalXp: student.total_xp });
                updated++;
            } else {
                skipped++;
            }
        }

        res.json({
            message: `Migration complete. ${updated} students updated, ${skipped} already correct.`,
            updated,
            skipped,
            details: results
        });
    } catch (error) {
        console.error('Migration Error:', error);
        res.status(500).json({ message: 'Migration failed.' });
    }
};
