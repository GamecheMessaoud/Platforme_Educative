import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.course.findMany();
    console.log('--- COURSES LIST ---');
    courses.forEach(c => {
        console.log(`ID: ${c.id} | Title: ${c.title} | Students: ${c.studentsCount} | Rating: ${c.rating}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
