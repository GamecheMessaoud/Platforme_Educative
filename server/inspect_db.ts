import { prisma } from './src/config/database';

async function main() {
    const courses = await prisma.course.findMany({
        select: { id: true, title_ar: true, is_published: true, category_id: true }
    });
    console.log('--- COURSES ---');
    console.log(JSON.stringify(courses, null, 2));

    const enrollments = await prisma.enrollment.findMany({
        include: { course: true, student: { include: { user: true } } }
    });
    console.log('--- ENROLLMENTS ---');
    console.log(JSON.stringify(enrollments.map(e => ({
        id: e.id,
        course: e.course.title_ar,
        student: e.student.user.email
    })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
