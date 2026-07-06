import { Router } from 'express';
import { getTeacherCourses, createCourse, updateCourse, deleteCourse, getStudentEnrollments, getPublishedCourses, enrollInCourse, getCourseById, getPublicCourseById } from '../controllers/course.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes must come before authMiddleware
router.get('/public', getPublishedCourses);
router.get('/public/:id', getPublicCourseById);
router.get('/', getPublishedCourses);

router.use(authMiddleware);
router.get('/my-enrollments', getStudentEnrollments);
router.get('/teacher', roleMiddleware('TEACHER'), getTeacherCourses);

// Parameterized routes
router.get('/:id', getCourseById);
router.post('/:id/enroll', roleMiddleware('STUDENT'), enrollInCourse);

// Teacher mutation routes
router.post('/', roleMiddleware('TEACHER'), createCourse);
router.put('/:id', roleMiddleware('TEACHER'), updateCourse);
router.delete('/:id', roleMiddleware('TEACHER'), deleteCourse);

export default router;
