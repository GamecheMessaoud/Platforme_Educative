import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { updateStudentStreak, recalculateStudentLevel } from '../utils/gamification';
import { evaluateBadges } from '../utils/badges';
import { createAndSendNotification } from './notification.controller';

/**
 * Mark a lesson as completed for the current student
 */
export const completeLesson = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { lessonId } = req.params as { lessonId: string };

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const student = await prisma.student.findUnique({
            where: { user_id: userId }
        });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId }
        });

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const existingProgress = await prisma.lessonProgress.findFirst({
            where: {
                student_id: student.id,
                lesson_id: lessonId
            }
        });

        if (existingProgress?.is_completed) {
            return res.status(200).json({ message: 'Lesson already completed', progress: existingProgress });
        }

        const result = await prisma.$transaction(async (tx) => {
            let badgeEarned = false;
            let earnedBadgeDetails = null;

            const progress = await tx.lessonProgress.upsert({
                where: {
                    student_id_lesson_id: {
                        student_id: student.id,
                        lesson_id: lessonId
                    }
                } as any,
                create: {
                    student_id: student.id,
                    lesson_id: lessonId,
                    is_completed: true,
                    xp_earned: lesson.xp_reward,
                    completed_at: new Date()
                },
                update: {
                    is_completed: true,
                    xp_earned: lesson.xp_reward,
                    completed_at: new Date()
                }
            });

            const updatedStudent = await tx.student.update({
                where: { id: student.id },
                data: {
                    total_xp: { increment: lesson.xp_reward }
                }
            });

            await tx.xpTransaction.create({
                data: {
                    student_id: student.id,
                    amount: lesson.xp_reward,
                    source: 'LESSON_COMPLETION',
                    source_id: lessonId
                }
            });

            // Level is recalculated OUTSIDE the transaction after all XP is finalized
            const newLevel = updatedStudent.current_level; // placeholder, fixed below

            let isJustFinished = false;
            let updatedEnrollment = null;

            const enrollment = await tx.enrollment.findFirst({
                where: {
                    student_id: student.id,
                    course_id: lesson.course_id
                }
            });

            const totalLessons = await tx.lesson.count({ where: { course_id: lesson.course_id } });
            const completedLessons = await tx.lessonProgress.count({
                where: {
                    student_id: student.id,
                    lesson: { course_id: lesson.course_id },
                    is_completed: true
                }
            });

            const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 100;

            if (enrollment) {
                isJustFinished = progressPercent === 100 && (enrollment.progress_percent < 100);

                updatedEnrollment = await tx.enrollment.update({
                    where: { id: enrollment.id },
                    data: {
                        progress_percent: progressPercent,
                        total_xp_earned: { increment: lesson.xp_reward },
                        status: progressPercent === 100 ? 'COMPLETED' : 'ACTIVE',
                        completed_at: progressPercent === 100 ? new Date() : null
                    }
                });
            } else {
                updatedEnrollment = await tx.enrollment.create({
                    data: {
                        student_id: student.id,
                        course_id: lesson.course_id,
                        progress_percent: progressPercent,
                        total_xp_earned: lesson.xp_reward,
                        status: progressPercent === 100 ? 'COMPLETED' : 'ACTIVE',
                        completed_at: progressPercent === 100 ? new Date() : null
                    }
                });
            }

            if (isJustFinished) {
                let badge = await tx.badge.findFirst({
                    where: { badge_type: 'COURSE_COMPLETION' }
                });

                if (!badge) {
                    badge = await tx.badge.create({
                        data: {
                            name_ar: 'خريج الدورة',
                            name_en: 'Course Graduate',
                            name_fr: 'Diplômé du cours',
                            description: 'منح لإنهاء جميع دروس الدورة بنجاح',
                            icon_url: '🎓',
                            badge_type: 'COURSE_COMPLETION',
                            requirement: 100,
                            xp_bonus: 500
                        }
                    });
                }

                const existingBadge = await tx.studentBadge.findFirst({
                    where: {
                        student_id: student.id,
                        badge_id: badge.id
                    }
                });

                if (!existingBadge) {
                    await tx.studentBadge.create({
                        data: {
                            student_id: student.id,
                            badge_id: badge.id
                        }
                    });

                    await tx.student.update({
                        where: { id: student.id },
                        data: { total_xp: { increment: badge.xp_bonus } }
                    });

                    await tx.xpTransaction.create({
                        data: {
                            student_id: student.id,
                            amount: badge.xp_bonus,
                            source: 'BADGE_EARNED',
                            source_id: badge.id
                        }
                    });
                    
                    badgeEarned = true;
                    earnedBadgeDetails = badge;
                }
            }

            return { progress, oldLevel: student.current_level, badgeEarned, earnedBadgeDetails, isJustFinished, enrollment: updatedEnrollment };
        });

        // Recalculate level using the correct progressive formula AFTER transaction
        const { newLevel, leveledUp } = await recalculateStudentLevel(student.id);

        // Update streak
        const streakResult = await updateStudentStreak(student.id);

        evaluateBadges(student.id, userId).catch(err => console.error("Badge Evaluation Error:", err));

        createAndSendNotification(
            student.user_id,
            'XP',
            'نقاط خبرة جديدة!',
            `لقد حصلت على ${lesson.xp_reward} نقطة خبرة جديدة من إكمال الدرس.`,
            '⭐'
        );

        if (leveledUp) {
            createAndSendNotification(
                student.user_id,
                'LEVEL_UP',
                'مستوى جديد!',
                `مذهل! لقد وصلت إلى المستوى ${newLevel} 🚀`,
                '🏆'
            );
        }

        if (streakResult?.streakIncremented) {
            createAndSendNotification(
                student.user_id,
                'STREAK',
                'سلسلة تعلم!',
                `رائع! استمررت ${streakResult.newStreak} يوم متواصل 🔥`,
                '🔥'
            );
        }

        if (result.badgeEarned && result.earnedBadgeDetails) {
            createAndSendNotification(
                student.user_id,
                'BADGE',
                'وسام جديد!',
                `لقد حزت على وسام "${result.earnedBadgeDetails.name_ar}"`,
                '🥇'
            );
        }

        res.status(200).json({
            message: 'Lesson marked as completed',
            xpAwarded: lesson.xp_reward,
            newLevel,
            leveledUp,
            newStreak: streakResult?.newStreak ?? student.current_streak,
            streakIncremented: streakResult?.streakIncremented ?? false,
            badgeEarned: result.badgeEarned,
            courseCompleted: result.isJustFinished,
            progress: result.progress
        });

    } catch (error: any) {
        console.error('Complete Lesson Error:', error);
        res.status(500).json({ message: error.message || 'Error completing lesson.' });
    }
};

/**
 * Get all completed lesson IDs for a specific course for the current student
 */
export const getCourseProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params as { courseId: string };

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const student = await prisma.student.findUnique({
            where: { user_id: userId }
        });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const progress = await prisma.lessonProgress.findMany({
            where: {
                student_id: student.id,
                is_completed: true,
                lesson: {
                    course_id: courseId
                }
            },
            select: {
                lesson_id: true
            }
        });

        res.json(progress.map(p => p.lesson_id));

    } catch (error: any) {
        console.error('Get Course Progress Error:', error);
        res.status(500).json({ message: 'Error retrieving course progress.' });
    }
};
