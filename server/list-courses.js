
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.course.findMany({
        select: { id: true, title_ar: true, is_published: true }
    });
    console.log('COURSES:', JSON.stringify(courses, null, 2));

    const submissions = await prisma.submission.findMany({
        take: 5
    });
    console.log('SUBMISSIONS:', JSON.stringify(submissions, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
