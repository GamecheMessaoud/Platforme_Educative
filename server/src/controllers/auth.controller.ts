import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendOtpEmail, sendWelcomeEmail } from '../utils/email';
import crypto from 'crypto';

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildUserResponse = (user: any, studentProfile?: any) => ({
    id: user.id,
    email: user.email,
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    avatar_url: user.avatar_url,
    studentProfile: studentProfile
        ? {
              total_xp: studentProfile.total_xp,
              current_streak: studentProfile.current_streak,
              current_level: studentProfile.current_level,
              placement_completed: studentProfile.placement_completed,
              subscription_status: studentProfile.subscription_status,
              subscription_end_date: studentProfile.subscription_end_date,
          }
        : undefined,
});

// ── Register ──────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
    console.log('[DEBUG] Register handler started');
    try {
        const { email, password, full_name, role = 'STUDENT' } = req.body;

        const nameParts = (full_name || '').trim().split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        const validRoles = ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'];
        const assignedRole = validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'STUDENT';

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'البريد الإلكتروني مسجل بالفعل' });
            return;
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: { email, password_hash: hashedPassword, first_name, last_name, role: assignedRole as any },
            });

            if (assignedRole === 'STUDENT') {
                await tx.student.create({ data: { user_id: user.id, skill_level: 'BEGINNER' } });
            } else if (assignedRole === 'TEACHER') {
                await tx.teacher.create({ data: { user_id: user.id } });
            } else if (assignedRole === 'PARENT') {
                await tx.parent.create({ data: { user_id: user.id } });
            }

            return user;
        });

        // Send welcome email (non-blocking)
        sendWelcomeEmail(email, first_name || full_name).catch(err =>
            console.error('[Email] Welcome email failed:', err.message)
        );

        const token = generateToken(newUser.id, newUser.role);
        const refreshToken = generateRefreshToken(newUser.id);

        res.status(201).json({
            message: 'تم إنشاء الحساب بنجاح',
            token,
            refresh_token: refreshToken,
            user: buildUserResponse(newUser, assignedRole === 'STUDENT' ? {
                total_xp: 0, current_streak: 0, current_level: 1,
                placement_completed: false, subscription_status: 'NONE', subscription_end_date: null,
            } : undefined),
        });
    } catch (error: any) {
        console.error('Registration error', error);
        res.status(500).json({ message: 'خطأ في الخادم أثناء التسجيل', error: error.message });
    }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { studentProfile: true },
        });

        if (!user || !user.is_active) {
            res.status(401).json({ message: 'بيانات الدخول غير صحيحة أو الحساب غير نشط' });
            return;
        }

        // Allow social login users to log in without a password if password_hash is empty
        if (!user.password_hash) {
            res.status(401).json({ message: 'هذا الحساب مرتبط بتسجيل دخول اجتماعي. استخدم Google للدخول.' });
            return;
        }

        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
            return;
        }

        const token = generateToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            token,
            refresh_token: refreshToken,
            user: buildUserResponse(user, user.studentProfile),
        });
    } catch (error) {
        console.error('Login error', error);
        res.status(500).json({ message: 'خطأ في الخادم أثناء تسجيل الدخول' });
    }
};

// ── Get Me ────────────────────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ message: 'غير مصرح' }); return; }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { studentProfile: true, teacherProfile: true },
        });

        if (!user) { res.status(404).json({ message: 'المستخدم غير موجود' }); return; }

        const { password_hash, reset_otp, reset_otp_expires, google_id, ...rest } = user as any;
        res.json({ ...rest, full_name: `${rest.first_name} ${rest.last_name}`.trim() });
    } catch (error) {
        console.error('GetMe error', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
};

// ── Refresh Token ─────────────────────────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refresh } = req.body;
        if (!refresh) { res.status(400).json({ message: 'Refresh token مطلوب' }); return; }

        const decoded = verifyRefreshToken(refresh);
        if (!decoded?.id) { res.status(401).json({ message: 'Token غير صالح أو منتهي' }); return; }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, is_active: true },
        });

        if (!user?.is_active) { res.status(401).json({ message: 'الحساب غير نشط' }); return; }

        res.json({ access: generateToken(user.id, user.role) });
    } catch {
        res.status(401).json({ message: 'Token غير صالح أو منتهي' });
    }
};

// ── Social Login / Google ─────────────────────────────────────────────────────
export const socialLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { provider, email, name, googleId, avatarUrl } = req.body;

        if (!email) { res.status(400).json({ message: 'البريد الإلكتروني مطلوب' }); return; }

        let user = await prisma.user.findUnique({
            where: { email },
            include: { studentProfile: true },
        });

        if (!user) {
            const nameParts = (name || '').trim().split(' ');
            const first_name = nameParts[0] || 'مستخدم';
            const last_name = nameParts.slice(1).join(' ') || '';

            user = await prisma.$transaction(async (tx: any) => {
                const newUser = await tx.user.create({
                    data: {
                        email,
                        password_hash: '',
                        first_name,
                        last_name,
                        role: 'STUDENT',
                        avatar_url: avatarUrl || null,
                        ...(googleId ? { google_id: googleId } : {}),
                    } as any,
                    include: { studentProfile: true },
                });
                await tx.student.create({ data: { user_id: newUser.id, skill_level: 'BEGINNER' } });
                return tx.user.findUnique({
                    where: { id: newUser.id },
                    include: { studentProfile: true },
                });
            });

            // Send welcome email (non-blocking)
            sendWelcomeEmail(email, name).catch(err =>
                console.error('[Email] Welcome email failed:', err.message)
            );
        } else if (googleId && !(user as any).google_id) {
            // Link google_id if not yet set
            await prisma.user.update({ where: { id: user.id }, data: { google_id: googleId } as any });
        }

        if (!user?.is_active) { res.status(401).json({ message: 'الحساب غير نشط' }); return; }

        const token = generateToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            token,
            refresh_token: refreshToken,
            user: buildUserResponse(user, (user as any).studentProfile),
        });
    } catch (error: any) {
        console.error('Social login error', error);
        res.status(500).json({ message: 'خطأ في الخادم أثناء تسجيل الدخول الاجتماعي', error: error.message });
    }
};

// ── Forgot Password (Real OTP) ────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) { res.status(400).json({ message: 'البريد الإلكتروني مطلوب' }); return; }

        const user = await prisma.user.findUnique({ where: { email } });

        // Always return same message to prevent user enumeration
        if (!user) {
            res.json({ message: 'إذا كان البريد مسجلاً ستصلك رسالة قريباً.' });
            return;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save OTP in DB
        await (prisma.user.update as any)({
            where: { email },
            data: { reset_otp: otp, reset_otp_expires: expiresAt },
        });

        // Send email
        await sendOtpEmail(email, otp, user.first_name || 'بطل');

        console.log(`[forgotPassword] OTP sent to ${email}`);
        res.json({ message: 'إذا كان البريد مسجلاً ستصلك رسالة قريباً.' });
    } catch (error: any) {
        console.error('ForgotPassword error', error);
        res.status(500).json({ message: 'حدث خطأ أثناء إرسال البريد الإلكتروني' });
    }
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) { res.status(400).json({ message: 'البريد والرمز مطلوبان' }); return; }

        const user = await prisma.user.findUnique({ where: { email } }) as any;

        if (!user || !user.reset_otp || !user.reset_otp_expires) {
            res.status(400).json({ message: 'الرمز غير صالح أو لم يُطلب استرداد' });
            return;
        }

        if (user.reset_otp !== otp) {
            res.status(400).json({ message: 'الرمز غير صحيح' });
            return;
        }

        if (new Date() > new Date(user.reset_otp_expires)) {
            res.status(400).json({ message: 'انتهت صلاحية الرمز، اطلب رمزاً جديداً' });
            return;
        }

        // Generate a short-lived reset token to use in the next step
        const resetToken = crypto.randomBytes(32).toString('hex');
        await (prisma.user.update as any)({
            where: { email },
            data: { reset_otp: resetToken },
        });

        res.json({ message: 'تم التحقق بنجاح', reset_token: resetToken });
    } catch (error: any) {
        console.error('VerifyOtp error', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, password, email } = req.body;
        if (!token || !password || !email) {
            res.status(400).json({ message: 'Token، البريد وكلمة المرور الجديدة مطلوبة' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } }) as any;

        if (!user || user.reset_otp !== token) {
            res.status(400).json({ message: 'رمز إعادة التعيين غير صالح' });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({ message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
            return;
        }

        const hashedPassword = await hashPassword(password);

        await (prisma.user.update as any)({
            where: { email },
            data: {
                password_hash: hashedPassword,
                reset_otp: null,
                reset_otp_expires: null,
            },
        });

        res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error: any) {
        console.error('ResetPassword error', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
};

// ── Upload Avatar ─────────────────────────────────────────────────────────────
export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'غير مصرح' });
            return;
        }

        const file = req.file;
        if (!file) {
            res.status(400).json({ message: 'يرجى إرفاق صورة' });
            return;
        }

        const publicUrl = `/uploads/images/${file.filename}`;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { avatar_url: publicUrl },
        });

        res.json({ message: 'تم رفع الصورة بنجاح', avatar_url: publicUrl });
    } catch (error: any) {
        console.error('uploadAvatar error', error);
        res.status(500).json({ message: 'خطأ في الخادم أثناء رفع الصورة' });
    }
};
