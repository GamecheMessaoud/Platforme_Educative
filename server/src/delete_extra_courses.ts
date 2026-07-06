import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const seedTitles = [
        "سكراتش 3 مع PictoBlox",
        "الذكاء الاصطناعي للمبتدئين",
        "أردوينو المستوى الأول (لبنات)",
        "أردوينو المستوى الثاني (C++)",
        "أساسيات بايثون",
        "تصميم مواقع ويب شامل",
        "تطوير تطبيقات الجوال (مبتدئ)",
        "الطباعة وتصميم ثلاثي الأبعاد"
    ];

    console.log("Deleting seeded extra courses...");

    let deletedCount = 0;

    for (const title of seedTitles) {
        const courses = await prisma.course.findMany({
            where: { title_ar: title }
        });

        for (const course of courses) {
            await prisma.course.delete({
                where: { id: course.id }
            });
            console.log(`Deleted course: ${title}`);
            deletedCount++;
        }
    }

    console.log(`Finished! Deleted ${deletedCount} extra seeded courses.`);
}

main()
    .catch((e) => {
        console.error("Error cleaning up courses:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
