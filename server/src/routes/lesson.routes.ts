import { Router } from 'express';
import { getCourseLessons, createLesson, updateLesson, deleteLesson, uploadLessonPdf } from '../controllers/lesson.controller';
import { completeLesson, getCourseProgress } from '../controllers/progress.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { lessonUpload } from '../middlewares/lessonUpload.middleware';

const router = Router();

router.use(authMiddleware);

// Students and Teachers can view lessons
router.get('/course/:courseId', getCourseLessons);

// Students can mark lessons as complete and view course progress
router.post('/:lessonId/complete', completeLesson);
router.get('/course/:courseId/progress', getCourseProgress);

// Only Teachers can manage lessons
router.post('/', roleMiddleware('TEACHER'), createLesson);
router.put('/:id', roleMiddleware('TEACHER'), updateLesson);
router.delete('/:id', roleMiddleware('TEACHER'), deleteLesson);
router.post('/upload-pdf', roleMiddleware('TEACHER'), lessonUpload.single('pdf'), uploadLessonPdf);

export default router;
