import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Database Cleanup and Fresh Seeding...');

    // 1. Cleanup existing educational data
    console.log('🧹 Cleaning up old data...');
    await prisma.lessonProgress.deleteMany({});
    await prisma.enrollment.deleteMany({});
    await prisma.submission.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.category.deleteMany({});

    // 2. Ensure Teacher exists
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
                bio: 'Expert in Technical Education for Kids',
                specialization: 'Full Stack Tech'
            }
        });
    }

    const categoriesData = [
        { name_ar: 'المنطق والبرمجة', name_en: 'Scratch', name_fr: 'Scratch', slug: 'scratch', icon: '🎨', color: '#ff6600' },
        { name_ar: 'لغات البرمجة', name_en: 'Python', name_fr: 'Python', slug: 'python', icon: '🐍', color: '#3776ab' },
        { name_ar: 'الذكاء الاصطناعي', name_en: 'Artificial Intelligence', name_fr: 'Intelligence Artificielle', slug: 'ai', icon: '🧠', color: '#6366f1' },
        { name_ar: 'إنترنت الأشياء', name_en: 'Arduino & Electronics', name_fr: 'Arduino & Electronique', slug: 'arduino', icon: '🔌', color: '#10b981' },
        { name_ar: 'تطوير الألعاب', name_en: 'Game Dev', name_fr: 'Dév de Jeux', slug: 'gamedev', icon: '🕹️', color: '#f43f5e' },
        { name_ar: 'برمجة المواقع', name_en: 'Web Design', name_fr: 'Design Web', slug: 'webdev', icon: '🌐', color: '#06b6d4' },
        { name_ar: 'الروبوتات', name_en: 'Robotics', name_fr: 'Robotique', slug: 'robotics', icon: '🤖', color: '#a855f7' }
    ];

    const coursesData = [
        {
            slug: 'scratch-3',
            category_slug: 'scratch',
            title_ar: 'Scratch 3.0: المستوى الأول',
            title_en: 'Scratch 3.0: Level 1',
            title_fr: 'Scratch 3.0: Niveau 1',
            desc: 'تعلم بناء القصص والألعاب عبر السحب والإفلات ببساطة تامة.',
            difficulty: 'BEGINNER',
            xp: 500
        },
        {
            slug: 'python-pro',
            category_slug: 'python',
            title_ar: 'Python Pro: لغة المستقبل',
            title_en: 'Python Pro: Future Language',
            title_fr: 'Python Pro: Langue du Futur',
            desc: 'اللغة الأكثر طلباً في العالم مبسطة لتجارب ممتعة وتطبيقات واقعية.',
            difficulty: 'INTERMEDIATE',
            xp: 800
        },
        {
            slug: 'ai-kids',
            category_slug: 'ai',
            title_ar: 'الذكاء الاصطناعي للصغار',
            title_en: 'AI for Kids',
            title_fr: 'IA pour les Enfants',
            desc: 'اكتشف كيف تفكر الآلات وتعلم بناء نماذج ذكية تتفاعل مع العالم المحيط.',
            difficulty: 'ADVANCED',
            xp: 1000
        },
        {
            slug: 'arduino-basic',
            category_slug: 'arduino',
            title_ar: 'مدخل إلى الأردوينو والإلكترونيات',
            title_en: 'Intro to Arduino',
            title_fr: 'Intro à Arduino',
            desc: 'اصنع دوائرك الإلكترونية الخاصة وتحكم في الأجهزة والأنوار بذكاء وإبداع.',
            difficulty: 'INTERMEDIATE',
            xp: 750
        },
        {
            slug: 'game-dev-unity',
            category_slug: 'gamedev',
            title_ar: 'برمجة الألعاب الاحترافية',
            title_en: 'Professional Game Dev',
            title_fr: 'Dév de Jeux Pro',
            desc: 'حول خيالك إلى حقيقة وتعلم برمجة ألعاب ثنائية وثلاثية الأبعاد مذهلة.',
            difficulty: 'INTERMEDIATE',
            xp: 900
        },
        {
            slug: 'web-design-kids',
            category_slug: 'webdev',
            title_ar: 'تصميم وبناء مواقع الإنترنت',
            title_en: 'Web Design for Kids',
            title_fr: 'Design Web pour Enfants',
            desc: 'ابدأ رحلتك في بناء مواقع الإنترنت باستخدام HTML, CSS و JavaScript باحترافية.',
            difficulty: 'BEGINNER',
            xp: 600
        },
        {
            slug: 'robotics-smart',
            category_slug: 'robotics',
            title_ar: 'بناء وبرمجة الروبوتات',
            title_en: 'Smart Robotics',
            title_fr: 'Robotique Intelligente',
            desc: 'تحكم في الآلات والمحركات وابنِ أول روبوت ذكي خاص بك.',
            difficulty: 'ADVANCED',
            xp: 1200
        }
    ];

    for (const cat of categoriesData) {
        const category = await prisma.category.create({ data: cat });

        const courseInfo = coursesData.find(c => c.category_slug === cat.slug);
        if (courseInfo) {
            console.log(`✨ Creating course: ${courseInfo.title_en}`);
            await prisma.course.create({
                data: {
                    category_id: category.id,
                    teacher_id: teacher.id,
                    title_ar: courseInfo.title_ar,
                    title_en: courseInfo.title_en,
                    title_fr: courseInfo.title_fr,
                    description: courseInfo.desc,
                    difficulty: courseInfo.difficulty,
                    xp_reward: courseInfo.xp,
                    is_published: true,
                    lessons: {
                        create: [
                            {
                                title_ar: 'مقدمة في ' + cat.name_ar,
                                title_en: 'Introduction to ' + cat.name_en,
                                title_fr: 'Introduction à ' + cat.name_fr,
                                content_ar: 'مرحباً بك في أول درس! دعنا نستكشف ' + cat.name_ar + ' معاً بشكل ممتع.',
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
    }

    console.log('✅ Database Reset and Fresh Seeding Completed Successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
