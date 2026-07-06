import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Detailed Courses...');

    // 1. Get or Create Teacher (Moha)
    let user = await prisma.user.findUnique({ where: { email: 'moha@kidtech.com' } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'moha@kidtech.com',
                password_hash: '$2b$10$YourHashedPasswordHere',
                first_name: 'Moha',
                last_name: 'Admin',
                role: 'ADMIN',
            }
        });
    }

    let teacher = await prisma.teacher.findUnique({ where: { user_id: user.id } });
    if (!teacher) {
        teacher = await prisma.teacher.create({
            data: {
                user_id: user.id,
                bio: 'Expert in Kids Tech and Programming',
                specialization: 'AI, Robotics, Web Dev, Game Dev'
            }
        });
    }

    const categories = [
        { name_ar: 'الذكاء الاصطناعي', name_en: 'Artificial Intelligence', name_fr: 'Intelligence Artificielle', slug: 'ai', icon: '🧠', color: '#6366f1' },
        { name_ar: 'إنترنت الأشياء', name_en: 'Arduino & Electronics', name_fr: 'Arduino & Electronique', slug: 'arduino', icon: '🔌', color: '#10b981' },
        { name_ar: 'تطوير الألعاب', name_en: 'Game Dev', name_fr: 'Dév de Jeux', slug: 'gamedev', icon: '🕹️', color: '#f43f5e' },
        { name_ar: 'برمجة المواقع', name_en: 'Web Design', name_fr: 'Design Web', slug: 'webdev', icon: '🌐', color: '#06b6d4' },
        { name_ar: 'الروبوتات', name_en: 'Robotics', name_fr: 'Robotique', slug: 'robotics', icon: '🤖', color: '#a855f7' }
    ];

    for (const catData of categories) {
        const category = await prisma.category.upsert({
            where: { slug: catData.slug },
            update: catData,
            create: catData
        });

        console.log(`Ensuring course for category: ${catData.name_en}`);

        let courseTitleAr = '';
        let courseTitleFr = '';
        let courseDesc = '';
        let difficulty = 'BEGINNER';

        switch (catData.slug) {
            case 'ai':
                courseTitleAr = 'الذكاء الاصطناعي للصغار';
                courseTitleFr = 'IA pour les enfants';
                courseDesc = 'اكتشف كيف تفكر الآلات وتعلم بناء نماذج ذكية تتفاعل مع العالم المحيط.';
                difficulty = 'ADVANCED';
                break;
            case 'arduino':
                courseTitleAr = 'مدخل إلى الأردوينو والإلكترونيات';
                courseTitleFr = 'Intro à Arduino';
                courseDesc = 'اصنع دوائرك الإلكترونية الخاصة وتحكم في الأجهزة والأنوار بذكاء وإبداع.';
                difficulty = 'INTERMEDIATE';
                break;
            case 'gamedev':
                courseTitleAr = 'برمجة الألعاب الاحترافية';
                courseTitleFr = 'Dév de Jeux Pro';
                courseDesc = 'حول خيالك إلى حقيقة وتعلم برمجة ألعاب ثنائية وثلاثية الأبعاد مذهلة.';
                difficulty = 'INTERMEDIATE';
                break;
            case 'webdev':
                courseTitleAr = 'تصميم وبناء مواقع الإنترنت';
                courseTitleFr = 'Design Web';
                courseDesc = 'ابدأ رحلتك في بناء مواقع الإنترنت باستخدام HTML, CSS و JavaScript باحترافية.';
                difficulty = 'BEGINNER';
                break;
            case 'robotics':
                courseTitleAr = 'بناء وبرمجة الروبوتات';
                courseTitleFr = 'Robotique pour enfants';
                courseDesc = 'تحكم في الآلات والمحركات وابنِ أول روبوت ذكي خاص بك.';
                difficulty = 'ADVANCED';
                break;
        }

        await prisma.course.create({
            data: {
                category_id: category.id,
                teacher_id: teacher.id,
                title_ar: courseTitleAr,
                title_en: catData.name_en + ' for Kids',
                title_fr: courseTitleFr,
                description: courseDesc,
                difficulty: difficulty as any,
                is_published: true,
                estimated_duration: 120,
                xp_reward: 500,
                lessons: {
                    create: [
                        {
                            title_ar: 'مقدمة في ' + catData.name_ar,
                            title_en: 'Intro to ' + catData.name_en,
                            title_fr: 'Intro à ' + catData.name_fr,
                            content_ar: 'مرحباً بك في هذا المسار الممتع! سنبدأ اليوم رحلة استكشاف ' + catData.name_ar,
                            lesson_type: 'VIDEO',
                            xp_reward: 100,
                            youtube_url: 'https://www.youtube.com/watch?v=kYJ-l2O2bHk',
                            order_index: 0
                        }
                    ]
                }
            }
        });
    }

    console.log('Detailed Seeding Completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
