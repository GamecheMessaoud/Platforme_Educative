import { prisma } from './src/config/database';

async function main() {
    const titlesToDelete = ["Scratch 3.0", "Python Basics", "ssd"];

    console.log('--- STARTING CLEANUP ---');

    const deleted = await prisma.course.deleteMany({
        where: {
            title_ar: {
                in: titlesToDelete
            }
        }
    });

    console.log(`Deleted ${deleted.count} stale courses (including their enrollments and lessons via Cascade).`);

    // Also check for titles in English field just in case
    const deletedEn = await prisma.course.deleteMany({
        where: {
            title_en: {
                in: titlesToDelete
            }
        }
    });

    console.log(`Deleted ${deletedEn.count} additional courses by English title.`);

    console.log('--- CLEANUP FINISHED ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
