
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const title = "تعلم أساسيات البرم";
    const course = await prisma.course.findFirst({
        where: {
            OR: [
                { title_ar: { contains: title } },
                { title_fr: { contains: title } },
                { title_en: { contains: title } }
            ]
        }
    });

    if (course) {
        console.log('Deleting course:', course.title_ar, 'ID:', course.id);
        await prisma.course.delete({ where: { id: course.id } });
        console.log('Deleted successfully.');
    } else {
        console.log('Course not found with title:', title);
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
