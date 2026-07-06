import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// Helper to ensure Teacher record exists for a user
async function getOrCreateTeacher(userId: string) {
    let teacher = await prisma.teacher.findUnique({
        where: { user_id: userId }
    });

    if (!teacher) {
        teacher = await prisma.teacher.create({
            data: { user_id: userId, specialization: 'General' }
        });
    }
    return teacher;
}

// Helper to ensure Category exists
async function getOrCreateCategory(slug: string, nameAr: string) {
    let category = await prisma.category.findUnique({
        where: { slug }
    });

    if (!category) {
        let nameEn = nameAr;
        let nameFr = nameAr;

        if (slug.toLowerCase() === 'scratch') {
            nameEn = 'Scratch'; nameFr = 'Scratch'; nameAr = 'سكراتش';
        } else if (slug.toLowerCase() === 'python') {
            nameEn = 'Python'; nameFr = 'Python'; nameAr = 'بايثون';
        } else if (slug.toLowerCase() === 'mobile-dev') {
            nameEn = 'Mobile Dev'; nameFr = 'Développement Mobile'; nameAr = 'تطبيقات الهاتف';
        } else if (slug.toLowerCase() === 'web-dev') {
            nameEn = 'Web Dev'; nameFr = 'Développement Web'; nameAr = 'تطوير الويب';
        } else if (slug.toLowerCase() === 'ai') {
            nameEn = 'AI'; nameFr = 'IA'; nameAr = 'الذكاء الاصطناعي';
        } else if (slug.toLowerCase() === '3d-printing') {
            nameEn = '3D Printing'; nameFr = 'Impression 3D'; nameAr = 'الطباعة الثلاثية الأبعاد';
        }

        category = await prisma.category.create({
            data: { slug, name_ar: nameAr, name_en: nameEn, name_fr: nameFr }
        });
    }
    return category;
}

export const getStudentEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'غير مصرح' });
            return;
        }

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            res.json([]);
            return;
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { student_id: student.id },
            include: {
                course: {
                    include: {
                        category: true,
                        lessons: {
                            select: { id: true }
                        }
                    }
                }
            },
            orderBy: { started_at: 'desc' }
        });

        // Get actual completed lessons count for each course
        const lessonProgress = await prisma.lessonProgress.findMany({
            where: {
                student_id: student.id,
                is_completed: true
            },
            select: {
                lesson_id: true,
                lesson: {
                    select: { course_id: true }
                }
            }
        });

        const completedByCourse: Record<string, number> = {};
        lessonProgress.forEach(lp => {
            const cId = lp.lesson.course_id;
            completedByCourse[cId] = (completedByCourse[cId] || 0) + 1;
        });

        // Format for student dashboard
        const formatted = enrollments.map((e: any) => {
            const course = e.course;
            const totalLessons = course.lessons.length;
            const actualCompleted = completedByCourse[course.id] || 0;
            const actualProgress = totalLessons > 0 ? Math.min(100, Math.round((actualCompleted / totalLessons) * 100)) : 100;

            return {
                id: course.id,
                title: course.title_ar || course.title_en,
                subtitle: course.category.name_ar || course.category.name_fr,
                progress: actualProgress,
                lessonsCount: totalLessons,
                completedLessons: actualCompleted,
                imageUrl: course.thumbnail_url || null,
                emoji: course.category.slug === 'scratch' ? '🎨' :
                    course.category.slug === 'python' ? '🐍' : '🤖',
                gradient: course.category.slug === 'scratch' ? 'from-orange-500 to-pink-500' :
                    course.category.slug === 'python' ? 'from-yellow-500 to-orange-500' : 'from-blue-500 to-indigo-600',
                nextLesson: 'واصل التعلم',
                duration: course.estimated_duration || 60,
                difficulty: course.difficulty === 'BEGINNER' ? 'مبتدئ' : course.difficulty === 'INTERMEDIATE' ? 'متوسط' : 'متقدم',
                xpReward: course.xp_reward
            };
        });

        res.json(formatted);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching enrollments' });
    }
};

export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const courseId = req.params.id as string;

        if (!userId) {
            res.status(401).json({ error: 'غير مصرح' });
            return;
        }

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            res.status(403).json({ error: 'حساب الطالب غير موجود' });
            return;
        }

        // Check if course exists
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            res.status(404).json({ error: 'الدورة غير موجودة' });
            return;
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                student_id: student.id,
                course_id: courseId
            }
        });

        if (existingEnrollment) {
            res.status(400).json({ error: 'أنت مسجل بالفعل في هذه الدورة' });
            return;
        }

        // Create enrollment
        const newEnrollment = await prisma.enrollment.create({
            data: {
                student_id: student.id,
                course_id: courseId,
                progress_percent: 0
            }
        });

        res.status(201).json(newEnrollment);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'خطأ أثناء التسجيل في الدورة' });
    }
};

export const getPublishedCourses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        let studentId: string | null = null;

        let student: any = null;
        if (userId) {
            student = await prisma.student.findUnique({ where: { user_id: userId } });
            studentId = student?.id || null;
        }

        const courses = await prisma.course.findMany({
            where: { is_published: true },
            include: {
                category: true,
                teacher: {
                    include: { user: { select: { first_name: true, last_name: true } } }
                },
                enrollments: studentId ? {
                    where: { student_id: studentId }
                } : false
            },
            orderBy: { created_at: 'desc' }
        });

        const formatted = courses.map((c: any) => {
            let isRecommended = false;
            let isLocked = false;

            if (student) {
                // Map DB difficulty to skill level string
                const courseDifficulty = c.difficulty || 'BEGINNER';
                const studentSkill = student.skill_level || 'BEGINNER';
                
                if (courseDifficulty === studentSkill) {
                    isRecommended = true;
                } else if (studentSkill === 'BEGINNER' && courseDifficulty === 'ADVANCED') {
                    // Lock advanced courses for absolute beginners
                    isLocked = true;
                }
            }

            return {
                id: c.id,
                title: c.title_ar,
                description: c.description || '',
                level: c.difficulty === 'BEGINNER' ? 'مبتدئ' : c.difficulty === 'INTERMEDIATE' ? 'متوسط' : 'متقدم',
                price: 0,
                imageUrl: c.thumbnail_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
                duration: c.estimated_duration || 60,
                xpReward: c.xp_reward,
                category: { name: c.category.name_ar, slug: c.category.slug },
                isEnrolled: c.enrollments && c.enrollments.length > 0,
                isRecommended,
                isLocked,
                teacher: {
                    full_name: c.teacher?.user ? `${c.teacher.user.first_name} ${c.teacher.user.last_name}` : 'المدرب المعتمد',
                    avatar: c.teacher?.user?.avatar_url
                }
            };
        });

        res.json(formatted);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching published courses' });
    }
};

export const getTeacherCourses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'غير مصرح' });
            return;
        }

        const teacher = await prisma.teacher.findUnique({ where: { user_id: userId } });
        if (!teacher) {
            res.json([]);
            return;
        }

        const courses = await prisma.course.findMany({
            where: { teacher_id: teacher.id },
            include: {
                category: true,
                _count: {
                    select: { enrollments: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Format for frontend
        const formatted = courses.map((c: any) => ({
            id: c.id,
            title: c.title_ar,
            description: c.description || '',
            thumbnail: c.thumbnail_url || '',
            category: c.category.slug,
            status: c.is_published ? 'published' : 'draft',
            difficulty: c.difficulty,
            createdAt: c.created_at,
            studentsCount: c._count?.enrollments || 0,
            rating: 4.8
        }));

        res.json(formatted);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching courses' });
    }
};

export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'غير مصرح' });
            return;
        }

        const {
            title_ar, title_en, title_fr,
            description, description_en, description_fr,
            learning_objectives, estimated_duration,
            thumbnail, categoryType, difficulty, xp_reward, level, status
        } = req.body;

        if (!title_ar || !categoryType) {
            res.status(400).json({ error: 'عنوان الدورة وتصنيفها مطلوبان' });
            return;
        }

        const teacher = await getOrCreateTeacher(userId);
        const category = await getOrCreateCategory(categoryType.toLowerCase(), categoryType);

        const newCourse = await prisma.course.create({
            data: {
                title_ar: title_ar,
                title_fr: title_fr || title_ar,
                title_en: title_en || title_ar,
                description,
                description_en,
                description_fr,
                learning_objectives,
                estimated_duration: parseInt(estimated_duration) || 60,
                thumbnail_url: thumbnail || '',
                difficulty: difficulty || 'BEGINNER',
                level: parseInt(level) || 1,
                xp_reward: parseInt(xp_reward) || 100,
                is_published: status === 'published',
                category: { connect: { id: category.id } },
                teacher: { connect: { id: teacher.id } }
            } as any
        });

        res.status(201).json(newCourse);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error creating course' });
    }
};

export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const {
            title_ar, title_en, title_fr,
            description, description_en, description_fr,
            learning_objectives, estimated_duration,
            thumbnail, categoryType, status, difficulty, xp_reward, level
        } = req.body;

        const updateData: any = {};
        if (title_ar !== undefined) updateData.title_ar = title_ar;
        if (title_fr !== undefined) updateData.title_fr = title_fr;
        if (title_en !== undefined) updateData.title_en = title_en;

        if (description !== undefined) updateData.description = description;
        if (description_en !== undefined) updateData.description_en = description_en;
        if (description_fr !== undefined) updateData.description_fr = description_fr;
        if (learning_objectives !== undefined) updateData.learning_objectives = learning_objectives;
        if (estimated_duration !== undefined) updateData.estimated_duration = parseInt(estimated_duration) || 60;

        if (thumbnail !== undefined) updateData.thumbnail_url = thumbnail;
        if (status !== undefined) updateData.is_published = (status === 'published');
        if (difficulty !== undefined) updateData.difficulty = difficulty;
        if (level !== undefined) updateData.level = parseInt(level) || 1;
        if (xp_reward !== undefined) updateData.xp_reward = parseInt(xp_reward) || 100;

        if (categoryType !== undefined) {
            const category = await getOrCreateCategory(categoryType.toLowerCase(), categoryType);
            updateData.category_id = category.id;
        }

        const updated = await prisma.course.update({
            where: { id },
            data: updateData
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error updating course' });
    }
};

export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.course.delete({ where: { id } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error deleting course' });
    }
};

export const getCourseById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                category: true,
                teacher: {
                    include: {
                        user: {
                            select: { first_name: true, last_name: true }
                        }
                    }
                }
            }
        });

        if (!course) {
            res.status(404).json({ error: 'الكورس غير موجود' });
            return;
        }

        res.json(course);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching course' });
    }
};

export const getPublicCourseById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                category: true,
                teacher: {
                    include: {
                        user: { select: { first_name: true, last_name: true, avatar_url: true } }
                    }
                },
                lessons: {
                    select: { id: true, title_ar: true, lesson_type: true, order_index: true },
                    orderBy: { order_index: 'asc' }
                },
                _count: {
                    select: { enrollments: true }
                }
            }
        });

        if (!course) {
            res.status(404).json({ error: 'الدورة غير موجودة' });
            return;
        }

        const publicData = {
            id: course.id,
            title: course.title_ar,
            description: course.description || '',
            thumbnailUrl: course.thumbnail_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
            duration: course.estimated_duration || 60,
            learningObjectives: typeof course.learning_objectives === 'string' ? JSON.parse(course.learning_objectives) : course.learning_objectives || [],
            difficulty: course.difficulty === 'BEGINNER' ? 'مبتدئ' : course.difficulty === 'INTERMEDIATE' ? 'متوسط' : 'متقدم',
            category: { name: course.category.name_ar, slug: course.category.slug },
            teacher: {
                name: course.teacher?.user ? `${course.teacher.user.first_name} ${course.teacher.user.last_name}` : 'المدرب المعتمد',
                avatar: course.teacher?.user?.avatar_url
            },
            studentsCount: course._count?.enrollments || 0,
            lessonsCount: course.lessons.length,
            lessons: course.lessons,
        };

        res.json(publicData);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching public course data' });
    }
};
