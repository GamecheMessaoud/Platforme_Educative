import { prisma, connectDB } from '../src/config/database';

async function main() {
    await connectDB();

    const course = await prisma.course.findFirst({
        where: {
            title_ar: { contains: 'تعلم أساسيات البرمجة' }
        }
    });

    if (course) {
        console.log('Found course:', course.title_ar, 'ID:', course.id);
        await prisma.course.delete({
            where: { id: course.id }
        });
        console.log('Successfully deleted course and its related data.');
    } else {
        console.log('Course not found with exact keyword, trying broader search...');
        const anyCourse = await prisma.course.findMany({
            where: { title_ar: { contains: 'تعلم' } }
        });
        console.log('Found courses with "تعلم":', anyCourse.map(c => c.title_ar));
        if (anyCourse.length > 0) {
            await prisma.course.delete({ where: { id: anyCourse[0].id } });
            console.log('Deleted the first matching course:', anyCourse[0].title_ar);
        }
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
