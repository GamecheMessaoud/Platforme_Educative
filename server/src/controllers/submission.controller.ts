import { Request, Response } from 'express';
import { prisma } from '../config/database';
import path from 'path';
import fs from 'fs';
import { createAndSendNotification } from './notification.controller';

/* ─────────────────────────────────────────
   GET /api/submissions/my
   Returns ALL submissions for the authenticated student
───────────────────────────────────────── */
export const getMySubmissions = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'غير مصرح' });
        }

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            return res.json([]);
        }

        const submissions = await prisma.submission.findMany({
            where: { student_id: student.id },
            orderBy: { submitted_at: 'desc' },
        });

        const courseSlugMap: Record<string, string> = {
            'scratch': 'تطوير الألعاب بسكراتش',
            'python': 'أساسيات البرمجة ببايثون',
            'ai': 'ذكاء اصطناعي للناشئين',
            'web-dev': 'تطوير الويب',
            'arduino': 'أردوينو والروبوتات',
            'game-dev': 'تطوير الألعاب',
            'robotics': 'الروبوتات',
        };

        const formatted = submissions.map(s => ({
            id: s.id,
            courseTitle: courseSlugMap[s.course_slug] || s.course_slug,
            courseSlug: s.course_slug,
            lessonTitle: `الدرس ${s.lesson_ref_id}`,
            lessonRefId: s.lesson_ref_id,
            fileName: s.file_name,
            fileSize: s.file_size,
            fileType: s.file_type,
            status: s.status.toUpperCase(),
            feedback: s.professor_feedback,
            description: s.description,
            date: s.submitted_at.toISOString().split('T')[0],
            submittedAt: s.submitted_at,
            reviewedAt: s.reviewed_at,
            xp: s.status === 'approved' ? 100 : s.status === 'pending' ? 50 : 0,
            fileUrl: `/api/submissions/${s.id}/download`,
        }));

        return res.json(formatted);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentRecentSubmissions = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'غير مصرح' });
        }

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            return res.json([]);
        }

        const submissions = await prisma.submission.findMany({
            where: { student_id: student.id },
            orderBy: { submitted_at: 'desc' },
            take: 10,
        });

        const courseSlugMap: Record<string, string> = {
            'scratch': 'تطوير الألعاب بسكراتش',
            'python': 'أساسيات البرمجة ببايثون',
            'ai': 'ذكاء اصطناعي للناشئين',
            'web-dev': 'تطوير الويب',
            'arduino': 'أردوينو والروبوتات',
            'game-dev': 'تطوير الألعاب',
            'robotics': 'الروبوتات',
        };

        const formatted = submissions.map(s => ({
            id: s.id,
            courseTitle: courseSlugMap[s.course_slug] || s.course_slug,
            lessonTitle: `الدرس ${s.lesson_ref_id}`,
            fileName: s.file_name,
            status: s.status,
            submittedAt: s.submitted_at,
            professorFeedback: s.professor_feedback,
        }));

        return res.json(formatted);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ─────────────────────────────────────────
   GET /api/submissions/student/:studentId/lesson/:lessonId
   Returns the latest submission for a student+lesson
───────────────────────────────────────── */
export const getSubmissionByLesson = async (req: Request, res: Response) => {
    try {
        const studentId = req.params.studentId as string;
        const lessonId = req.params.lessonId as string;

        if (!studentId || !lessonId) {
            return res.status(400).json({ success: false, message: 'studentId and lessonId are required' });
        }

        const submission = await prisma.submission.findFirst({
            where: {
                student_id: studentId,
                OR: [
                    { lesson_id: lessonId } as any,
                    { description: { contains: `lessonId:${lessonId}` } }
                ]
            },
            orderBy: { submitted_at: 'desc' }
        });

        if (!submission) {
            return res.json({ success: true, submission: null });
        }
        return res.json({ success: true, submission: formatSubmission(submission) });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ─────────────────────────────────────────
   POST /api/submissions/upload
   Student uploads a file for a lesson
───────────────────────────────────────── */
export const uploadSubmission = async (req: Request, res: Response) => {
    try {
        const { lessonRefId, lessonId, courseSlug = 'scratch', submissionType = 'scratch-project', description, submissionUrl, submissionText } = req.body;
        const studentId = req.params.studentId as string;

        // At least ONE content source must be provided: file, url, or text
        if (!req.file && !submissionUrl && !submissionText) {
            return res.status(400).json({ success: false, message: 'يرجى إرفاق ملف أو رابط أو نص تسليم' });
        }

        if (!lessonRefId || !studentId) {
            return res.status(400).json({ success: false, message: 'بيانات ناقصة: studentId أو lessonRefId' });
        }

        // Verify student exists
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'الطالب غير موجود' });
        }

        // Embed lessonId into description for lookup
        const fullDescription = lessonId
            ? `lessonId:${lessonId}${description ? ' | ' + description : ''}`
            : (description as string || undefined);

        const submissionRecord = await prisma.submission.create({
            data: {
                student_id: studentId,
                lesson_ref_id: parseInt(lessonRefId),
                course_slug: courseSlug,
                // File fields (optional)
                file_name: (req.file?.originalname as string) ?? undefined,
                file_path: (req.file?.path as string) ?? undefined,
                file_size: (req.file?.size as number) ?? undefined,
                file_type: req.file ? path.extname(req.file.originalname).toLowerCase() : undefined,
                // Alternative submission fields
                submission_url: (submissionUrl as string) || undefined,
                submission_text: (submissionText as string) || undefined,
                submission_type: submissionType,
                description: fullDescription,
                lesson_id: (lessonId as string) || undefined,
                status: 'pending',
            } as any,
        });

        return res.status(201).json({
            success: true,
            message: 'تم إرسال التسليم بنجاح',
            submission: formatSubmission(submissionRecord),
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return res.status(500).json({ success: false, message: error.message || 'خطأ في الخادم' });
    }
};

/* ─────────────────────────────────────────
   GET /api/submissions/student/:studentId
   Student views their own submissions
   Query: ?lesson_ref_id=3
───────────────────────────────────────── */
export const getStudentSubmissions = async (req: Request, res: Response) => {
    try {
        const studentId = req.params.studentId as string;
        const { lesson_ref_id, course_slug = 'scratch' } = req.query;

        const where: any = { student_id: studentId, course_slug };
        if (lesson_ref_id) where.lesson_ref_id = parseInt(lesson_ref_id as string);

        const submissions = await prisma.submission.findMany({
            where,
            orderBy: { submitted_at: 'desc' },
        });

        return res.json({ success: true, submissions: submissions.map(formatSubmission) });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ─────────────────────────────────────────
   GET /api/submissions/teacher/course/:slug
   Teacher views all submissions for a course
   Query: ?status=pending
───────────────────────────────────────── */
export const getTeacherSubmissions = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const { status } = req.query;

        console.log(`Fetching submissions for course slug: ${slug}, status: ${status}`);

        const where: any = {};
        if (slug && slug !== 'all') where.course_slug = slug;
        if (status) where.status = status;

        const submissions = await prisma.submission.findMany({
            where,
            orderBy: { submitted_at: 'desc' },
            include: {
                student: {
                    include: { user: { select: { first_name: true, last_name: true, email: true } } },
                },
            },
        });

        const formatted = submissions.map((s: any) => ({
            ...formatSubmission(s),
            student_name: s.student?.user ? `${s.student.user.first_name} ${s.student.user.last_name}` : 'غير معروف',
            student_email: s.student?.user?.email ?? '',
        }));

        return res.json({ success: true, submissions: formatted });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ─────────────────────────────────────────
   PATCH /api/submissions/:id/review
   Teacher approves/rejects + adds feedback
   Body: { status, professor_feedback, reviewedBy }
───────────────────────────────────────── */
export const reviewSubmission = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status, professor_feedback, reviewedBy } = req.body;

        if (!['approved', 'rejected', 'reviewing'].includes(status)) {
            return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const submissionRecord = await tx.submission.update({
                where: { id },
                data: {
                    status,
                    professor_feedback: professor_feedback || null,
                    reviewed_at: new Date(),
                    reviewed_by: reviewedBy || null,
                },
            });

            // Award 100 XP if approved
            if (status === 'approved') {
                await tx.student.update({
                    where: { id: submissionRecord.student_id },
                    data: {
                        total_xp: { increment: 100 }
                    }
                });

                // Record XP transaction
                await tx.xpTransaction.create({
                    data: {
                        student_id: submissionRecord.student_id,
                        amount: 100,
                        source: 'SUBMISSION_APPROVAL',
                        source_id: submissionRecord.id
                    }
                });
            }

            return submissionRecord;
        });

        res.json({
            success: true,
            message: 'تم تحديث حالة التسليم',
            submission: formatSubmission(result),
        });

        // Notify Student
        try {
            const student = await prisma.student.findUnique({
                 where: { id: result.student_id }
            });
            if (student) {
                const isApproved = status === 'approved';
                createAndSendNotification(
                    student.user_id,
                    'SUBMISSION_REVIEWED',
                    isApproved ? 'تم قبول مشروعك 🎉' : 'مراجعة جديدة',
                    isApproved ? 'لقد تم تقييم مشروعك وحصلت على 100 نقطة خبرة!' : 'لقد تم تقييم مشروعك، وتوجد ملاحظات من المعلم.',
                    isApproved ? '✅' : '👀',
                    '/submissions'
                );
            }
        } catch (err) { console.error('Submission Notification Error:', err); }
        
        return;
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'التسليم غير موجود' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ─────────────────────────────────────────
   GET /api/submissions/:id/download
   Serves the actual file
───────────────────────────────────────── */
export const downloadSubmission = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const submissionRecord = await prisma.submission.findUnique({ where: { id } });

        if (!submissionRecord) return res.status(404).json({ success: false, message: 'الملف غير موجود' });

        if (!submissionRecord.file_path || !fs.existsSync(submissionRecord.file_path)) {
            return res.status(404).json({ success: false, message: 'لا يوجد ملف مرفق بهذا التسليم' });
        }

        // Fix: Changed 'submission' to 'submissionRecord'
        return res.download(submissionRecord.file_path, submissionRecord.file_name ?? 'submission');
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* helper */
function formatSubmission(s: any) {
    return {
        id: s.id,
        lessonRefId: s.lesson_ref_id,
        courseSlug: s.course_slug,
        fileName: s.file_name,
        fileSize: s.file_size,
        fileType: s.file_type,
        submissionType: s.submission_type,
        submissionUrl: s.submission_url,
        submissionText: s.submission_text,
        description: s.description,
        status: s.status,
        professorFeedback: s.professor_feedback,
        submittedAt: s.submitted_at,
        reviewedAt: s.reviewed_at,
        fileUrl: s.file_path ? `/api/submissions/${s.id}/download` : null,
    };
}
