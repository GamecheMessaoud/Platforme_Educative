import { prisma } from './src/config/database';

async function getOrCreateCategory(slug: string, nameAr: string) {
    let category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
        category = await prisma.category.create({
            data: {
                slug,
                name_ar: nameAr,
                name_en: nameAr,
                name_fr: nameAr
            }
        });
    }
    return category;
}

async function main() {
    const teacherId = 'fa4ef408-c364-43c1-944c-7a2882cd65a0';

    const coursesToSeed = [
        {
            title: 'Scratch 3.0',
            slug: 'scratch',
            categoryName: 'سكراتش',
            status: 'published',
            description: 'تعلم البرمجة من خلال سكراتش',
            emoji: '🎨'
        },
        {
            title: 'Python Basics',
            slug: 'python',
            categoryName: 'بايثون',
            status: 'published',
            description: 'أساسيات لغة البرمجة بايثون',
            emoji: '🐍'
        },
        {
            title: 'Web Development',
            slug: 'web-dev',
            categoryName: 'تطوير الويب',
            status: 'draft',
            description: 'تعلم بناء المواقع الإلكترونية',
            emoji: '🌐'
        },
        {
            title: 'Robotics 101',
            slug: 'robotics',
            categoryName: 'الروبوتات',
            status: 'review',
            description: 'مدخل إلى عالم الروبوتات',
            emoji: '🤖'
        }
    ];

    for (const c of coursesToSeed) {
        const category = await getOrCreateCategory(c.slug, c.categoryName);

        await prisma.course.create({
            data: {
                title_ar: c.title,
                title_en: c.title,
                title_fr: c.title,
                description: c.description,
                category_id: category.id,
                teacher_id: teacherId,
                is_published: c.status === 'published'
            }
        });
        console.log(`Created course: ${c.title}`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(() => process.exit(0));
