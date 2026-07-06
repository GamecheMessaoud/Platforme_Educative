import { prisma } from '../config/database';
import { createAndSendNotification } from '../controllers/notification.controller';

/**
 * Automatically evaluates and awards badges to a student based on their progress.
 * Should be called whenever progress or XP increases.
 */
export const evaluateBadges = async (studentId: string, userId: string): Promise<void> => {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { badges: { select: { badge_id: true } } }
        });

        if (!student) return;

        // Fetch all available badges
        const allBadges = await prisma.badge.findMany();
        const earnedBadgeIds = new Set(student.badges.map(b => b.badge_id));

        const newlyEarnedBadges: any[] = [];

        // Check criteria for each badge
        for (const badge of allBadges) {
            if (earnedBadgeIds.has(badge.id)) continue; // Already has badge

            let meetsCriteria = false;

            switch (badge.badge_type) {
                case 'STREAK':
                    meetsCriteria = student.current_streak >= badge.requirement;
                    break;
                case 'LEVEL':
                    meetsCriteria = student.current_level >= badge.requirement;
                    break;
                case 'XP':
                    meetsCriteria = student.total_xp >= badge.requirement;
                    break;
                case 'PROJECTS':
                    const projectCount = await prisma.submission.count({
                        where: { student_id: studentId, status: 'approved' }
                    });
                    meetsCriteria = projectCount >= badge.requirement;
                    break;
                case 'COMMUNITY':
                    const communityCount = await prisma.communityPost.count({
                        where: { author_id: studentId }
                    });
                    meetsCriteria = communityCount >= badge.requirement;
                    break;
                default:
                    // Unknown type
                    break;
            }

            if (meetsCriteria) {
                newlyEarnedBadges.push(badge);
            }
        }

        // Award the badges
        if (newlyEarnedBadges.length > 0) {
            await prisma.studentBadge.createMany({
                data: newlyEarnedBadges.map(b => ({
                    student_id: student.id,
                    badge_id: b.id
                }))
            });

            // Add XP bonuses and notify user
            let totalXpBonus = 0;
            for (const badge of newlyEarnedBadges) {
                totalXpBonus += badge.xp_bonus;

                // Create Transaction Log
                await prisma.xpTransaction.create({
                    data: {
                        student_id: student.id,
                        amount: badge.xp_bonus,
                        source: `BADGE_UNLOCK_${badge.id}`
                    }
                });

                // Send realtime SSE notification
                await createAndSendNotification(
                    userId,
                    'BADGE',
                    `وسام جديد: ${badge.name_ar}`,
                    `تهانينا! لقد حصلت على وسام ${badge.name_ar} وكسبت ${badge.xp_bonus} XP. ${badge.description || ''}`,
                    badge.icon_url || '🏆'
                );
            }

            // Update user total XP with bonuses
            if (totalXpBonus > 0) {
                await prisma.student.update({
                    where: { id: student.id },
                    data: { total_xp: { increment: totalXpBonus } }
                });
            }
        }

    } catch (error) {
        console.error('Evaluate Badges Error:', error);
    }
};
