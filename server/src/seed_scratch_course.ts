import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Ensuring Admin Teacher and Scratch Category...');

    // 1. Find or Create Admin User
    let user = await prisma.user.findUnique({
        where: { email: 'moha@kidtech.com' }
    });

    if (!user) {
        console.log('Creating admin user...');
        user = await prisma.user.create({
            data: {
                email: 'moha@kidtech.com',
                password_hash: '$2b$10$YourHashedPasswordHere', // Replace with a real hash if needed, but for seeding it might be fine
                first_name: 'Moha',
                last_name: 'Admin',
                role: 'ADMIN',
            }
        });
    } else {
        // Ensure role is ADMIN
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        });
    }

    // 2. Ensure Teacher Profile
    let teacher = await prisma.teacher.findUnique({
        where: { user_id: user.id }
    });

    if (!teacher) {
        console.log('Creating teacher profile...');
        teacher = await prisma.teacher.create({
            data: {
                user_id: user.id,
                bio: 'Expert in Kids Tech and Programming',
                specialization: 'Scratch, Python, Web Dev'
            }
        });
    }

    // 3. Ensure Category exists
    let category = await prisma.category.findUnique({
        where: { slug: 'scratch' }
    });

    if (!category) {
        console.log('Creating Scratch category...');
        category = await prisma.category.create({
            data: {
                name_ar: 'سكراتش',
                name_en: 'Scratch',
                name_fr: 'Scratch',
                slug: 'scratch',
                icon: '🎨',
                color: '#4C97FF'
            }
        });
    }

    // 4. Create the Course
    console.log('Adding Scratch 3 Course...');
    const course = await prisma.course.create({
        data: {
            category_id: category.id,
            teacher_id: teacher.id,
            title_ar: 'برمجة سكراتش 3 للمبتدئين',
            title_en: 'Scratch 3 Programming for Beginners',
            title_fr: 'Programmation Scratch 3 pour débutants',
            description: 'تعلم أساسيات البرمجة مع سكراتش 3 وابدأ رحلتك في عالم الإبداع الرقمي.',
            difficulty: 'BEGINNER',
            is_published: true,
            lessons: {
                create: [
                    {
                        title_ar: 'مقدمة في عالم سكراتش',
                        title_en: 'Introduction to Scratch World',
                        title_fr: 'Introduction au monde Scratch',
                        content_ar: 'في هذا الدرس سنتعرف على واجهة كيد تيك وسكراتش وكيفية تحريك الكائنات بشكل تفاعلي وممتع.',
                        lesson_type: 'VIDEO',
                        xp_reward: 100,
                        youtube_url: 'https://www.youtube.com/watch?v=kYJ-l2O2bHk',
                        lab_url: 'https://stempedia.com/pictoblox-web/',
                        guide_content: '1. سجل دخولك لموقع سكراتش.\n2. اختر كائناً جديداً من القائمة.\n3. اسحب لبنة "عند نقر العلم الأخضر".\n4. أضف لبنة "تحرك 10 خطوات".\n5. اضغط على العلم لتجربة الحركة!',
                        order_index: 0
                    }
                ]
            }
        }
    });

    console.log(`Course created: ${course.title_ar} (ID: ${course.id})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
