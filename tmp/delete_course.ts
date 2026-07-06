import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const courseTitle = 'برمجة سكراتش 3 للمبتدئين';
    const course = await prisma.course.findFirst({
        where: { title: courseTitle }
    });

    if (course) {
        console.log(`Found course: ${course.id}. Deleting...`);
        await prisma.course.delete({
            where: { id: course.id }
        });
        console.log('Deleted successfully.');
    } else {
        console.log('Course not found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
