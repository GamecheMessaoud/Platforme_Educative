import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import path from 'path';

export const getCourseLessons = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;
        const lessons = await prisma.lesson.findMany({
            where: { course_id: courseId as string },
            orderBy: { order_index: 'asc' }
        });
        res.json(lessons);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching lessons' });
    }
};

export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            courseId, title_ar, title_en, title_fr,
            content_ar, content_en, content_fr,
            video_url, youtube_url, lab_url,
            guide_content, extra_qcm, order_index,
            lesson_type, xp_reward, pdf_url, submission_url_example
        } = req.body;

        const lesson = await prisma.lesson.create({
            data: {
                course_id: courseId,
                title_ar,
                title_en: title_en || title_ar,
                title_fr: title_fr || title_ar,
                content_ar,
                content_en: content_en || content_ar,
                content_fr: content_fr || content_ar,
                video_url,
                youtube_url,
                lab_url,
                guide_content,
                extra_qcm: extra_qcm || {},
                lesson_type: lesson_type || 'VIDEO',
                xp_reward: xp_reward ? parseInt(xp_reward) : 50,
                order_index: order_index || 0,
                pdf_url: pdf_url || null,
                submission_url_example: submission_url_example || null
            }
        });

        res.status(201).json(lesson);
    } catch (error: any) {
        console.error('Error in createLesson:', error);
        res.status(500).json({ error: error.message || 'Error creating lesson' });
    }
};

export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            title_ar, title_en, title_fr,
            content_ar, content_en, content_fr,
            video_url, youtube_url, lab_url,
            guide_content, extra_qcm, order_index,
            lesson_type, xp_reward, pdf_url, submission_url_example
        } = req.body;

        const lesson = await prisma.lesson.update({
            where: { id: id as string },
            data: {
                title_ar,
                title_en,
                title_fr,
                content_ar,
                content_en,
                content_fr,
                video_url,
                youtube_url,
                lab_url,
                guide_content,
                extra_qcm,
                lesson_type,
                xp_reward: xp_reward ? parseInt(xp_reward) : undefined,
                order_index: order_index,
                pdf_url: pdf_url,
                submission_url_example: submission_url_example
            }
        });

        res.json(lesson);
    } catch (error: any) {
        console.error('Error in updateLesson:', error);
        res.status(500).json({ error: error.message || 'Error updating lesson' });
    }
};

export const deleteLesson = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.lesson.delete({ where: { id: id as string } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error deleting lesson' });
    }
};

export const uploadLessonPdf = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'لم يتم إرفاق ملف' });
        }

        // Return the public URL for the file
        // uploads/lesson-resources is served at /uploads
        const fileName = req.file.filename;
        const fileUrl = `/uploads/lesson-resources/${fileName}`;

        res.json({ url: fileUrl });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error uploading PDF' });
    }
};
