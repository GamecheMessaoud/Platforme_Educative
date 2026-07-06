const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING CLEANUP ---');

    // 1. Delete by Title
    const titleToDelete = 'برمجة سكراتش 3 للمبتدئين';
    const c1 = await prisma.course.findFirst({ where: { title: titleToDelete } });
    if (c1) {
        console.log(`Found by title: ${c1.id}. Deleting...`);
        await prisma.course.delete({ where: { id: c1.id } });
    }

    // 2. Delete by specific stats mentioned by user: 1245 students, 4.8 rating
    // Note: User said "delete in teacher dashbord دورة 1,245 طالب 4 سنوات 4.8 تقييم عام"
    const c2 = await prisma.course.findMany({
        where: {
            OR: [
                { studentsCount: 1245 },
                { rating: 4.8 }
            ]
        }
    });

    for (const c of c2) {
        if (c.title !== titleToDelete) { // avoid double delete
            console.log(`Found by stats (ID: ${c.id}, Title: ${c.title}, Students: ${c.studentsCount}). Deleting...`);
            try {
                await prisma.course.delete({ where: { id: c.id } });
            } catch (e) {
                console.error(`Failed to delete ${c.title}:`, e.message);
            }
        }
    }

    console.log('--- CLEANUP FINISHED ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
