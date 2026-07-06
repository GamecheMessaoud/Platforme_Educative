import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from './src/config/database';

async function main() {
    try {
        const userCount = await prisma.user.count();
        const courseCount = await prisma.course.count();
        const studentCount = await prisma.student.count();
        const teacherCount = await prisma.teacher.count();
        const categoryCount = await prisma.category.count();
        const lessonCount = await prisma.lesson.count();

        console.log('--- Database Stats ---');
        console.log(`Users: ${userCount}`);
        console.log(`Students: ${studentCount}`);
        console.log(`Teachers: ${teacherCount}`);
        console.log(`Categories: ${categoryCount}`);
        console.log(`Courses: ${courseCount}`);
        console.log(`Lessons: ${lessonCount}`);
        console.log('----------------------');

    } catch (err) {
        console.error('Error checking database:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
