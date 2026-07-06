import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const course = await prisma.course.findFirst({
        where: {
            title_ar: { contains: 'تعلم أساسيات البرم' }
        }
    });

    if (course) {
        console.log('Found course:', course.title_ar, 'ID:', course.id);

        // Prisma will cascade delete lessons, exercises, quizzes, enrollments, and submissions 
        // due to the onDelete: Cascade in the schema.
        await prisma.course.delete({
            where: { id: course.id }
        });

        console.log('Successfully deleted course and its related data.');
    } else {
        console.log('Course not found.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
