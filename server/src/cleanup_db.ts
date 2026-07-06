import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting cleanup...');

    // Delete in order of dependencies
    const enrollments = await prisma.enrollment.deleteMany({});
    console.log(`Deleted ${enrollments.count} enrollments.`);

    const lessonProgress = await prisma.lessonProgress.deleteMany({});
    console.log(`Deleted ${lessonProgress.count} lesson progress records.`);

    const lessons = await prisma.lesson.deleteMany({});
    console.log(`Deleted ${lessons.count} lessons.`);

    const courses = await prisma.course.deleteMany({});
    console.log(`Deleted ${courses.count} courses.`);

    console.log('Cleanup finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
