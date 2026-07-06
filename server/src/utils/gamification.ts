import { prisma } from '../config/database';

/**
 * XP required to REACH a given level.
 * Formula: level^2 * 200
 * Level 1 =    200 XP
 * Level 2 =    800 XP
 * Level 3 =  1,800 XP
 * Level 4 =  3,200 XP
 * Level 5 =  5,000 XP
 */
export const xpRequiredForLevel = (level: number): number => {
    return level * level * 200;
};

/**
 * Given a student's total XP, calculate the correct current level.
 */
export const calculateLevelFromXp = (totalXp: number): number => {
    let level = 1;
    while (xpRequiredForLevel(level + 1) <= totalXp) {
        level++;
    }
    return level;
};

/**
 * Update a student's streak based on current activity.
 * Logic:
 * - If last activity was today: do nothing (streak already counted).
 * - If last activity was yesterday: increment streak.
 * - If last activity was more than 1 day ago: reset streak to 1.
 * Returns the updated student and a flag indicating if streak changed.
 */
export const updateStudentStreak = async (studentId: string): Promise<{
    updated: boolean;
    newStreak: number;
    streakIncremented: boolean;
    streakReset: boolean;
} | null> => {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                current_streak: true,
                longest_streak: true,
                last_activity_at: true,
                last_streak_update: true
            }
        });

        if (!student) return null;

        const now = new Date();
        const lastUpdate = student.last_streak_update || new Date(0);

        // Normalize dates to UTC midnight to avoid local server timezone drift
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const lastUpdateDay = new Date(Date.UTC(lastUpdate.getUTCFullYear(), lastUpdate.getUTCMonth(), lastUpdate.getUTCDate()));

        const diffInDays = Math.floor((today.getTime() - lastUpdateDay.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            // Already updated today — just refresh last_activity_at, no streak change
            await prisma.student.update({
                where: { id: studentId },
                data: { last_activity_at: now }
            });
            return { updated: false, newStreak: student.current_streak, streakIncremented: false, streakReset: false };
        }

        let newStreak = 1;
        let streakIncremented = false;
        let streakReset = false;

        if (diffInDays === 1) {
            // Consecutive day — increment!
            newStreak = student.current_streak + 1;
            streakIncremented = true;
        } else {
            // Gap > 1 day — reset streak
            streakReset = true;
        }

        const newLongestStreak = Math.max(newStreak, student.longest_streak);

        await prisma.student.update({
            where: { id: studentId },
            data: {
                current_streak: newStreak,
                longest_streak: newLongestStreak,
                last_activity_at: now,
                last_streak_update: now
            }
        });

        return { updated: true, newStreak, streakIncremented, streakReset };
    } catch (error) {
        console.error('Update Streak Error:', error);
        return null;
    }
};

/**
 * Recalculates and corrects the level for a student based on their total_xp.
 * Used for migration and post-XP-award level syncing.
 */
export const recalculateStudentLevel = async (studentId: string): Promise<{ newLevel: number; leveledUp: boolean }> => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, total_xp: true, current_level: true }
    });
    if (!student) return { newLevel: 1, leveledUp: false };

    const correctLevel = calculateLevelFromXp(student.total_xp);
    const leveledUp = correctLevel > student.current_level;

    if (correctLevel !== student.current_level) {
        await prisma.student.update({
            where: { id: studentId },
            data: { current_level: correctLevel }
        });
    }

    return { newLevel: correctLevel, leveledUp };
};
