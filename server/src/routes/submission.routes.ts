import { Router } from 'express';
import {
    uploadSubmission,
    getStudentSubmissions,
    getTeacherSubmissions,
    reviewSubmission,
    downloadSubmission,
    getSubmissionByLesson,
    getMySubmissions,
    getStudentRecentSubmissions,
} from '../controllers/submission.controller';
import { upload } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Authenticated student gets all their submissions
// GET /api/submissions/my
router.get('/my', authMiddleware, getMySubmissions);

// GET /api/submissions/student-recent
router.get('/student-recent', authMiddleware, getStudentRecentSubmissions);

// Student uploads a file for a lesson
// POST /api/submissions/upload/:studentId
router.post('/upload/:studentId', upload.single('file'), uploadSubmission);

// Student views their own submissions
// GET /api/submissions/student/:studentId?lesson_ref_id=3
router.get('/student/:studentId', getStudentSubmissions);

// Get submission status for a specific lesson+student
// GET /api/submissions/student/:studentId/lesson/:lessonId
router.get('/student/:studentId/lesson/:lessonId', getSubmissionByLesson);

// Teacher views all submissions for a course
// GET /api/submissions/teacher/course/:slug?status=pending
router.get('/teacher/course/:slug', getTeacherSubmissions);

// Teacher reviews a submission (approve/reject + feedback)
// PATCH /api/submissions/:id/review
router.patch('/:id/review', reviewSubmission);

// Download a file
// GET /api/submissions/:id/download
router.get('/:id/download', downloadSubmission);

export default router;
