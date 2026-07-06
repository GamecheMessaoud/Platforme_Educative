import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing getting or creating category...');
        let slug = 'mobile-dev';
        let nameAr = 'تطبيقات الهاتف';

        let category = await prisma.category.findUnique({
            where: { slug }
        });

        if (!category) {
            console.log('Creating new category');
            category = await prisma.category.create({
                data: { slug, name_ar: nameAr, name_en: nameAr, name_fr: nameAr }
            });
        }

        console.log('Category:', category);

        console.log('Getting user for teacher role...');
        const teacherUser = await prisma.user.findFirst({
            where: { role: 'TEACHER' }
        });

        if (!teacherUser) {
            console.log('No teacher user found in DB');
            return;
        }

        let teacher = await prisma.teacher.findUnique({
            where: { user_id: teacherUser.id }
        });

        if (!teacher) {
            console.log('Creating new teacher profile');
            teacher = await prisma.teacher.create({
                data: { user_id: teacherUser.id, specialization: 'General' }
            });
        }

        console.log('Testing create course...');
        const course = await prisma.course.create({
            data: {
                title_ar: 'Test Course',
                title_fr: 'Test Course',
                title_en: 'Test Course',
                description: 'Test description',
                thumbnail_url: '',
                teacher_id: teacher.id,
                category_id: category.id,
                is_published: false
            }
        });

        console.log('Successfully created course:', course.id);
    } catch (e) {
        console.error('ERROR OCCURRED:');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
