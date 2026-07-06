import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { AuthRequest } from '../middlewares/auth.middleware';

// PUT /api/auth/profile — Update current user's name and email
export const updateProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'غير مصرح' });
            return;
        }

        const { first_name, last_name, email } = req.body;

        // Check email uniqueness if changed
        if (email) {
            const existing = await prisma.user.findFirst({
                where: { email, NOT: { id: userId } }
            });
            if (existing) {
                res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
                return;
            }
        }

        const updateData: any = {};
        if (first_name !== undefined) updateData.first_name = first_name;
        if (last_name !== undefined) updateData.last_name = last_name;
        if (email !== undefined) updateData.email = email;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                avatar_url: true,
            }
        });

        res.json({
            message: 'تم تحديث الملف الشخصي بنجاح',
            user: {
                ...updatedUser,
                full_name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(),
            }
        });
    } catch (error: any) {
        console.error('UpdateProfile error', error);
        res.status(500).json({ message: 'خطأ في تحديث البيانات' });
    }
};

// PUT /api/auth/password — Change current user's password
export const changePassword = async (req: any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'غير مصرح' });
            return;
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: 'كلمة المرور الحالية والجديدة مطلوبتان' });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'المستخدم غير موجود' });
            return;
        }

        const isValid = await comparePassword(currentPassword, user.password_hash);
        if (!isValid) {
            res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
            return;
        }

        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: userId },
            data: { password_hash: hashedPassword }
        });

        res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error: any) {
        console.error('ChangePassword error', error);
        res.status(500).json({ message: 'خطأ في تغيير كلمة المرور' });
    }
};

export const updateSkillLevel = async (req: any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'غير مصرح' });
            return;
        }

        const { skill_level_num } = req.body;
        if (skill_level_num === undefined) {
            res.status(400).json({ message: 'المستوى مطلوب' });
            return;
        }

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            res.status(404).json({ message: 'حساب الطالب غير موجود' });
            return;
        }

        await prisma.student.update({
            where: { id: student.id },
            data: { current_level: skill_level_num, placement_completed: true }
        });

        res.json({ message: 'تم تحديث المستوى بنجاح', level: skill_level_num });
    } catch (error: any) {
        console.error('UpdateSkillLevel error', error);
        res.status(500).json({ message: 'خطأ في تحديث المستوى' });
    }
};

// GET /api/auth/student/:id (Public Profile Endpoint)
export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const user = await prisma.user.findUnique({
            where: { id },
             include: {
                 studentProfile: {
                     include: {
                         badges: { include: { badge: true } },
                         community_posts: { 
                             take: 6, 
                             orderBy: { created_at: 'desc' }, 
                             include: { _count: { select: { comments: true, reactions: true } } } 
                         },
                         _count: { select: { enrollments: true } }
                     }
                 }
             }
        });
        
        if (!user || user.role !== 'STUDENT' || !(user as any).studentProfile) {
            res.status(404).json({ message: 'الملف الشخصي غير موجود' });
            return;
        }
        
        const profile = (user as any).studentProfile;
        
        res.json({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            studentStats: {
                total_xp: profile.total_xp,
                current_level: profile.current_level,
                current_streak: profile.current_streak,
                longest_streak: profile.longest_streak,
                enrollments_count: profile._count.enrollments,
                badges: profile.badges.map((b: any) => b.badge),
                projects: profile.community_posts
            }
        });
    } catch(err) { 
        console.error('getPublicProfile error', err);
        res.status(500).json({message: 'خطأ في الخادم'}); 
    }
};
