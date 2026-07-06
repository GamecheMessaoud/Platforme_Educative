import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🚀 Seeding 8 New Courses...\n');

    // 1. Ensure Admin Teacher
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

    // 2. Define Categories
    const categories = [
        { name_ar: 'برمجة الأطفال', name_en: 'Programming for Kids', name_fr: 'Programmation pour enfants', slug: 'programming-for-kids', icon: '🎮', color: '#4C97FF' },
        { name_ar: 'الذكاء الاصطناعي', name_en: 'Artificial Intelligence', name_fr: 'Intelligence Artificielle', slug: 'ai', icon: '🤖', color: '#6366f1' },
        { name_ar: 'أردوينو', name_en: 'Arduino', name_fr: 'Arduino', slug: 'arduino', icon: '🔌', color: '#10b981' },
        { name_ar: 'بايثون', name_en: 'Python', name_fr: 'Python', slug: 'python', icon: '🐍', color: '#3776AB' },
        { name_ar: 'تصميم المواقع', name_en: 'Web Design', name_fr: 'Conception Web', slug: 'webdesign', icon: '🌐', color: '#06b6d4' },
        { name_ar: 'تطبيقات الموبايل', name_en: 'Mobile Apps', name_fr: 'Applications Mobiles', slug: 'mobile-apps', icon: '📱', color: '#f59e0b' },
        { name_ar: 'التصميم ثلاثي الأبعاد', name_en: '3D Design', name_fr: 'Conception 3D', slug: '3d-design', icon: '🧊', color: '#8b5cf6' },
    ];

    // Upsert categories
    const categoryMap: Record<string, string> = {};
    for (const catData of categories) {
        const category = await prisma.category.upsert({
            where: { slug: catData.slug },
            update: catData,
            create: catData
        });
        categoryMap[catData.slug] = category.id;
        console.log(`✅ Category: ${catData.name_en} (${catData.icon})`);
    }

    // 3. Define all 8 courses
    const courses = [
        // ─────────────────────────────────────────────
        // 🎮 1. Scratch 3 + PictoBlox
        // ─────────────────────────────────────────────
        {
            category_slug: 'programming-for-kids',
            title_ar: 'سكراتش 3 مع PictoBlox',
            title_en: 'Scratch 3 with PictoBlox',
            title_fr: 'Scratch 3 avec PictoBlox',
            description: 'تعلم البرمجة باستخدام Scratch 3 وPictoBlox بطريقة ممتعة من خلال الألعاب والأنيميشن.',
            description_en: 'Learn programming using Scratch 3 and PictoBlox through fun games and animations.',
            description_fr: 'Apprenez la programmation avec Scratch 3 et PictoBlox de manière amusante.',
            difficulty: 'BEGINNER',
            level: 1,
            estimated_duration: 60,
            xp_reward: 100,
            is_published: true,
            learning_objectives: JSON.stringify([
                'التعرف على واجهة Scratch',
                'استخدام Blocks',
                'إنشاء ألعاب بسيطة',
                'إضافة أصوات وحركات',
                'بناء مشروع كامل'
            ]),
            lab_url: 'https://pictoblox.ai/',
            lessons: [
                {
                    title_ar: 'التعرف على واجهة Scratch',
                    title_en: 'Getting to Know Scratch Interface',
                    title_fr: 'Découvrir l\'interface Scratch',
                    content_ar: 'في هذا الدرس سنتعرف على واجهة سكراتش وكيفية التنقل بين الأقسام المختلفة.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    lab_url: 'https://pictoblox.ai/',
                    order_index: 0
                },
                {
                    title_ar: 'استخدام البلوكات الأساسية',
                    title_en: 'Using Basic Blocks',
                    title_fr: 'Utiliser les blocs de base',
                    content_ar: 'تعلم كيفية استخدام بلوكات الحركة والمظهر والصوت لإنشاء برنامجك الأول.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    lab_url: 'https://pictoblox.ai/',
                    order_index: 1
                },
                {
                    title_ar: 'إنشاء لعبة بسيطة',
                    title_en: 'Creating a Simple Game',
                    title_fr: 'Créer un jeu simple',
                    content_ar: 'ستتعلم كيفية إنشاء لعبة بسيطة للتحكم بالكائنات وجمع النقاط.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    lab_url: 'https://pictoblox.ai/',
                    order_index: 2
                },
                {
                    title_ar: 'إضافة أصوات وحركات',
                    title_en: 'Adding Sounds and Movements',
                    title_fr: 'Ajouter des sons et des mouvements',
                    content_ar: 'تعلم كيفية إضافة مؤثرات صوتية وتحريكات متنوعة لمشروعك.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    lab_url: 'https://pictoblox.ai/',
                    order_index: 3
                },
                {
                    title_ar: 'بناء مشروع كامل',
                    title_en: 'Building a Complete Project',
                    title_fr: 'Construire un projet complet',
                    content_ar: 'في هذا الدرس الأخير ستطبق كل ما تعلمته لبناء مشروع كامل ومتكامل.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    lab_url: 'https://pictoblox.ai/',
                    order_index: 4
                }
            ]
        },

        // ─────────────────────────────────────────────
        // 🤖 2. AI for Beginners (PictoBlox)
        // ─────────────────────────────────────────────
        {
            category_slug: 'ai',
            title_ar: 'الذكاء الاصطناعي للمبتدئين باستخدام PictoBlox',
            title_en: 'AI for Beginners with PictoBlox',
            title_fr: 'IA pour débutants avec PictoBlox',
            description: 'ابدأ تعلم الذكاء الاصطناعي عبر مشاريع سهلة مثل التعرف على الوجه والصوت.',
            description_en: 'Start learning AI with simple projects like face and voice recognition.',
            description_fr: 'Commencez à apprendre l\'IA avec des projets simples comme la reconnaissance faciale et vocale.',
            difficulty: 'BEGINNER',
            level: 1,
            estimated_duration: 75,
            xp_reward: 130,
            is_published: true,
            learning_objectives: JSON.stringify([
                'فهم AI',
                'استخدام PictoBlox',
                'التعرف على الصور',
                'مشاريع ذكية',
                'دمج AI مع الألعاب'
            ]),
            lab_url: 'https://pictoblox.ai/',
            lessons: [
                {
                    title_ar: 'مقدمة في الذكاء الاصطناعي',
                    title_en: 'Introduction to AI',
                    title_fr: 'Introduction à l\'IA',
                    content_ar: 'ما هو الذكاء الاصطناعي وكيف يعمل؟ تعرف على المفاهيم الأساسية.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    lab_url: 'https://pictoblox.ai/',
                    order_index: 0
                },
                {
                    title_ar: 'استخدام PictoBlox للذكاء الاصطناعي',
                    title_en: 'Using PictoBlox for AI',
                    title_fr: 'Utiliser PictoBlox pour l\'IA',
                    content_ar: 'تعلم كيفية استخدام أدوات الذكاء الاصطناعي المدمجة في PictoBlox.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    lab_url: 'https://pictoblox.ai/',
                    order_index: 1
                },
                {
                    title_ar: 'التعرف على الصور',
                    title_en: 'Image Recognition',
                    title_fr: 'Reconnaissance d\'images',
                    content_ar: 'بناء مشروع للتعرف على الصور باستخدام التعلم الآلي.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    lab_url: 'https://pictoblox.ai/',
                    order_index: 2
                },
                {
                    title_ar: 'مشاريع ذكية',
                    title_en: 'Smart Projects',
                    title_fr: 'Projets intelligents',
                    content_ar: 'إنشاء مشاريع ذكية تستخدم التعرف على الوجه والصوت.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    lab_url: 'https://pictoblox.ai/',
                    order_index: 3
                },
                {
                    title_ar: 'دمج AI مع الألعاب',
                    title_en: 'Integrating AI with Games',
                    title_fr: 'Intégrer l\'IA aux jeux',
                    content_ar: 'تعلم كيفية دمج تقنيات الذكاء الاصطناعي في ألعاب تفاعلية ممتعة.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    lab_url: 'https://pictoblox.ai/',
                    order_index: 4
                }
            ]
        },

        // ─────────────────────────────────────────────
        // 🔌 3. Arduino Level 01 (Blocks)
        // ─────────────────────────────────────────────
        {
            category_slug: 'arduino',
            title_ar: 'Arduino المستوى 1 (Blocks)',
            title_en: 'Arduino Level 1 (Blocks)',
            title_fr: 'Arduino Niveau 1 (Blocs)',
            description: 'تعلم Arduino باستخدام البرمجة بالبلوكات للتحكم في LED والحساسات بسهولة.',
            description_en: 'Learn Arduino using block programming to control LEDs and sensors.',
            description_fr: 'Apprenez Arduino en utilisant la programmation par blocs pour contrôler les LED et les capteurs.',
            difficulty: 'BEGINNER',
            level: 1,
            estimated_duration: 70,
            xp_reward: 110,
            is_published: true,
            learning_objectives: JSON.stringify([
                'التعرف على Arduino',
                'استخدام Blocks',
                'تشغيل LED',
                'قراءة Sensors',
                'مشروع بسيط'
            ]),
            lab_url: 'https://ide.mblock.cc/',
            lessons: [
                {
                    title_ar: 'التعرف على Arduino',
                    title_en: 'Getting to Know Arduino',
                    title_fr: 'Découvrir Arduino',
                    content_ar: 'ما هو Arduino؟ تعرف على المكونات الأساسية ولوحة التحكم.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    lab_url: 'https://ide.mblock.cc/',
                    order_index: 0
                },
                {
                    title_ar: 'البرمجة بالبلوكات',
                    title_en: 'Block Programming',
                    title_fr: 'Programmation par blocs',
                    content_ar: 'تعلم كيفية استخدام بيئة البرمجة بالبلوكات للتحكم في Arduino.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    lab_url: 'https://ide.mblock.cc/',
                    order_index: 1
                },
                {
                    title_ar: 'تشغيل LED',
                    title_en: 'Controlling LEDs',
                    title_fr: 'Contrôler les LED',
                    content_ar: 'تعلم كيفية توصيل وتشغيل أضواء LED باستخدام Arduino.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    lab_url: 'https://ide.mblock.cc/',
                    order_index: 2
                },
                {
                    title_ar: 'قراءة الحساسات',
                    title_en: 'Reading Sensors',
                    title_fr: 'Lire les capteurs',
                    content_ar: 'تعلم كيفية قراءة البيانات من الحساسات المختلفة.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    lab_url: 'https://ide.mblock.cc/',
                    order_index: 3
                },
                {
                    title_ar: 'مشروع بسيط',
                    title_en: 'Simple Project',
                    title_fr: 'Projet simple',
                    content_ar: 'بناء مشروع بسيط يجمع بين LED والحساسات.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    lab_url: 'https://ide.mblock.cc/',
                    order_index: 4
                }
            ]
        },

        // ─────────────────────────────────────────────
        // ⚡ 4. Arduino Level 02 (C++)
        // ─────────────────────────────────────────────
        {
            category_slug: 'arduino',
            title_ar: 'Arduino المستوى 2 باستخدام C++',
            title_en: 'Arduino Level 2 with C++',
            title_fr: 'Arduino Niveau 2 avec C++',
            description: 'تعلم برمجة Arduino باستخدام C++ وبناء مشاريع متقدمة.',
            description_en: 'Learn Arduino programming with C++ and build advanced projects.',
            description_fr: 'Apprenez la programmation Arduino avec C++ et construisez des projets avancés.',
            difficulty: 'INTERMEDIATE',
            level: 2,
            estimated_duration: 90,
            xp_reward: 150,
            is_published: true,
            learning_objectives: JSON.stringify([
                'أساسيات C++',
                'كتابة كود Arduino',
                'التحكم في الأجهزة',
                'مشاريع متقدمة',
                'Debugging'
            ]),
            lab_url: 'https://wokwi.com/',
            lessons: [
                {
                    title_ar: 'أساسيات C++',
                    title_en: 'C++ Basics',
                    title_fr: 'Bases de C++',
                    content_ar: 'تعلم أساسيات لغة C++ اللازمة لبرمجة Arduino.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    lab_url: 'https://wokwi.com/',
                    order_index: 0
                },
                {
                    title_ar: 'كتابة كود Arduino',
                    title_en: 'Writing Arduino Code',
                    title_fr: 'Écrire du code Arduino',
                    content_ar: 'تعلم كتابة أكواد Arduino باستخدام setup() و loop().',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    lab_url: 'https://wokwi.com/',
                    order_index: 1
                },
                {
                    title_ar: 'التحكم في الأجهزة',
                    title_en: 'Controlling Devices',
                    title_fr: 'Contrôler les appareils',
                    content_ar: 'تعلم كيفية التحكم في المحركات والشاشات والأجهزة الإلكترونية.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    lab_url: 'https://wokwi.com/',
                    order_index: 2
                },
                {
                    title_ar: 'مشاريع متقدمة',
                    title_en: 'Advanced Projects',
                    title_fr: 'Projets avancés',
                    content_ar: 'بناء مشاريع متقدمة تجمع بين عدة مكونات إلكترونية.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    lab_url: 'https://wokwi.com/',
                    order_index: 3
                },
                {
                    title_ar: 'تصحيح الأخطاء',
                    title_en: 'Debugging',
                    title_fr: 'Débogage',
                    content_ar: 'تعلم كيفية اكتشاف وإصلاح الأخطاء في كود Arduino.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    lab_url: 'https://wokwi.com/',
                    order_index: 4
                }
            ]
        },

        // ─────────────────────────────────────────────
        // 🐍 5. Python Essentials
        // ─────────────────────────────────────────────
        {
            category_slug: 'python',
            title_ar: 'أساسيات بايثون',
            title_en: 'Python Essentials',
            title_fr: 'Bases de Python',
            description: 'تعلم أساسيات Python من الصفر بطريقة سهلة.',
            description_en: 'Learn the fundamentals of Python from scratch in an easy way.',
            description_fr: 'Apprenez les bases de Python à partir de zéro de manière simple.',
            difficulty: 'BEGINNER',
            level: 1,
            estimated_duration: 80,
            xp_reward: 120,
            is_published: true,
            learning_objectives: JSON.stringify([
                'المتغيرات',
                'الشروط',
                'الحلقات',
                'الدوال',
                'مشاريع بسيطة'
            ]),
            lab_url: null,
            lessons: [
                {
                    title_ar: 'المتغيرات والأنواع',
                    title_en: 'Variables and Types',
                    title_fr: 'Variables et types',
                    content_ar: 'تعلم كيفية إنشاء المتغيرات وأنواع البيانات في بايثون.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    order_index: 0
                },
                {
                    title_ar: 'الشروط والقرارات',
                    title_en: 'Conditions and Decisions',
                    title_fr: 'Conditions et décisions',
                    content_ar: 'تعلم استخدام if/else لاتخاذ القرارات في البرنامج.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    order_index: 1
                },
                {
                    title_ar: 'الحلقات التكرارية',
                    title_en: 'Loops',
                    title_fr: 'Boucles',
                    content_ar: 'تعلم استخدام for و while لتكرار العمليات.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    order_index: 2
                },
                {
                    title_ar: 'الدوال',
                    title_en: 'Functions',
                    title_fr: 'Fonctions',
                    content_ar: 'تعلم كيفية إنشاء واستخدام الدوال لتنظيم الكود.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    order_index: 3
                },
                {
                    title_ar: 'مشاريع بسيطة',
                    title_en: 'Simple Projects',
                    title_fr: 'Projets simples',
                    content_ar: 'تطبيق ما تعلمته في مشاريع بايثون بسيطة وممتعة.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    order_index: 4
                }
            ]
        },

        // ─────────────────────────────────────────────
        // 🌐 6. Web Design (HTML CSS JS)
        // ─────────────────────────────────────────────
        {
            category_slug: 'webdesign',
            title_ar: 'تصميم مواقع الويب (HTML CSS JS)',
            title_en: 'Web Design (HTML CSS JS)',
            title_fr: 'Conception Web (HTML CSS JS)',
            description: 'تعلم بناء مواقع احترافية باستخدام HTML وCSS وJavaScript.',
            description_en: 'Learn to build professional websites using HTML, CSS, and JavaScript.',
            description_fr: 'Apprenez à créer des sites web professionnels avec HTML, CSS et JavaScript.',
            difficulty: 'BEGINNER',
            level: 1,
            estimated_duration: 100,
            xp_reward: 150,
            is_published: true,
            learning_objectives: JSON.stringify([
                'HTML',
                'CSS',
                'JavaScript',
                'تصميم UI',
                'موقع كامل'
            ]),
            lab_url: null,
            lessons: [
                {
                    title_ar: 'أساسيات HTML',
                    title_en: 'HTML Basics',
                    title_fr: 'Bases HTML',
                    content_ar: 'تعلم هيكلة صفحات الويب باستخدام عناصر HTML الأساسية.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    order_index: 0
                },
                {
                    title_ar: 'تنسيق بـ CSS',
                    title_en: 'Styling with CSS',
                    title_fr: 'Mise en forme avec CSS',
                    content_ar: 'تعلم تصميم وتنسيق صفحات الويب باستخدام CSS.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    order_index: 1
                },
                {
                    title_ar: 'مقدمة في JavaScript',
                    title_en: 'Introduction to JavaScript',
                    title_fr: 'Introduction à JavaScript',
                    content_ar: 'تعلم أساسيات JavaScript لإضافة التفاعل لصفحات الويب.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    order_index: 2
                },
                {
                    title_ar: 'تصميم واجهة المستخدم',
                    title_en: 'UI Design',
                    title_fr: 'Design UI',
                    content_ar: 'تعلم مبادئ تصميم واجهات المستخدم الجذابة والمتجاوبة.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    order_index: 3
                },
                {
                    title_ar: 'بناء موقع كامل',
                    title_en: 'Building a Complete Website',
                    title_fr: 'Construire un site complet',
                    content_ar: 'تطبيق كل المهارات لبناء موقع ويب كامل واحترافي.',
                    lesson_type: 'VIDEO',
                    xp_reward: 35,
                    order_index: 4
                }
            ]
        },

        // ─────────────────────────────────────────────
        // 📱 7. Mobile App (MIT App Inventor)
        // ─────────────────────────────────────────────
        {
            category_slug: 'mobile-apps',
            title_ar: 'تطوير تطبيقات الموبايل',
            title_en: 'Mobile App Development',
            title_fr: 'Développement d\'applications mobiles',
            description: 'تعلم إنشاء تطبيقات أندرويد بسهولة.',
            description_en: 'Learn to create Android apps easily.',
            description_fr: 'Apprenez à créer des applications Android facilement.',
            difficulty: 'BEGINNER',
            level: 1,
            estimated_duration: 60,
            xp_reward: 100,
            is_published: true,
            learning_objectives: JSON.stringify([
                'UI Design',
                'Blocks',
                'Logic',
                'Media',
                'App كامل'
            ]),
            lab_url: null,
            lessons: [
                {
                    title_ar: 'تصميم واجهة التطبيق',
                    title_en: 'App UI Design',
                    title_fr: 'Design UI de l\'application',
                    content_ar: 'تعلم كيفية تصميم واجهة تطبيق أندرويد باستخدام MIT App Inventor.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    order_index: 0
                },
                {
                    title_ar: 'البرمجة بالبلوكات',
                    title_en: 'Block Programming',
                    title_fr: 'Programmation par blocs',
                    content_ar: 'تعلم استخدام البلوكات لإضافة المنطق والتفاعل للتطبيق.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    order_index: 1
                },
                {
                    title_ar: 'المنطق البرمجي',
                    title_en: 'Programming Logic',
                    title_fr: 'Logique de programmation',
                    content_ar: 'تعلم الشروط والحلقات والمتغيرات في بيئة التطبيقات.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    order_index: 2
                },
                {
                    title_ar: 'الوسائط المتعددة',
                    title_en: 'Media Integration',
                    title_fr: 'Intégration multimédia',
                    content_ar: 'تعلم إضافة الصور والأصوات والكاميرا في تطبيقك.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    order_index: 3
                },
                {
                    title_ar: 'بناء تطبيق كامل',
                    title_en: 'Building a Complete App',
                    title_fr: 'Construire une application complète',
                    content_ar: 'تطبيق كل ما تعلمته لبناء تطبيق أندرويد كامل ومفيد.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    order_index: 4
                }
            ]
        },

        // ─────────────────────────────────────────────
        // 🧊 8. 3D Design
        // ─────────────────────────────────────────────
        {
            category_slug: '3d-design',
            title_ar: 'تصميم ثلاثي الأبعاد',
            title_en: '3D Design',
            title_fr: 'Conception 3D',
            description: 'تعلم إنشاء مجسمات 3D بطريقة سهلة.',
            description_en: 'Learn to create 3D models in an easy way.',
            description_fr: 'Apprenez à créer des modèles 3D de manière simple.',
            difficulty: 'BEGINNER',
            level: 1,
            estimated_duration: 70,
            xp_reward: 110,
            is_published: true,
            learning_objectives: JSON.stringify([
                'أساسيات 3D',
                'Shapes',
                'تصميم مجسمات',
                'Rendering',
                'مشروع'
            ]),
            lab_url: null,
            lessons: [
                {
                    title_ar: 'أساسيات التصميم ثلاثي الأبعاد',
                    title_en: '3D Design Basics',
                    title_fr: 'Bases de la conception 3D',
                    content_ar: 'تعلم المفاهيم الأساسية للتصميم ثلاثي الأبعاد.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    order_index: 0
                },
                {
                    title_ar: 'الأشكال الأساسية',
                    title_en: 'Basic Shapes',
                    title_fr: 'Formes de base',
                    content_ar: 'تعلم إنشاء الأشكال الهندسية الأساسية في بيئة 3D.',
                    lesson_type: 'VIDEO',
                    xp_reward: 20,
                    order_index: 1
                },
                {
                    title_ar: 'تصميم مجسمات',
                    title_en: 'Designing Models',
                    title_fr: 'Concevoir des modèles',
                    content_ar: 'تعلم تصميم مجسمات ثلاثية الأبعاد أكثر تعقيداً.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    order_index: 2
                },
                {
                    title_ar: 'العرض والتلوين',
                    title_en: 'Rendering and Coloring',
                    title_fr: 'Rendu et coloration',
                    content_ar: 'تعلم كيفية إضافة الألوان والمواد وعرض المجسمات.',
                    lesson_type: 'VIDEO',
                    xp_reward: 25,
                    order_index: 3
                },
                {
                    title_ar: 'مشروع نهائي',
                    title_en: 'Final Project',
                    title_fr: 'Projet final',
                    content_ar: 'بناء مشروع تصميم ثلاثي الأبعاد كامل.',
                    lesson_type: 'VIDEO',
                    xp_reward: 30,
                    order_index: 4
                }
            ]
        }
    ];

    // 4. Create all courses with their lessons
    for (const courseData of courses) {
        const { category_slug, lessons, lab_url, ...courseFields } = courseData;
        const categoryId = categoryMap[category_slug];

        if (!categoryId) {
            console.error(`❌ Category not found for slug: ${category_slug}`);
            continue;
        }

        // Check if course already exists
        const existingCourse = await prisma.course.findFirst({
            where: {
                title_en: courseFields.title_en,
                teacher_id: teacher.id
            }
        });

        if (existingCourse) {
            console.log(`⏩ Course already exists: ${courseFields.title_en} — skipping`);
            continue;
        }

        const course = await prisma.course.create({
            data: {
                category_id: categoryId,
                teacher_id: teacher.id,
                title_ar: courseFields.title_ar,
                title_en: courseFields.title_en,
                title_fr: courseFields.title_fr,
                description: courseFields.description,
                description_en: courseFields.description_en,
                description_fr: courseFields.description_fr,
                difficulty: courseFields.difficulty,
                level: courseFields.level,
                estimated_duration: courseFields.estimated_duration,
                xp_reward: courseFields.xp_reward,
                is_published: courseFields.is_published,
                learning_objectives: courseFields.learning_objectives,
                lessons: {
                    create: lessons.map(lesson => ({
                        title_ar: lesson.title_ar,
                        title_en: lesson.title_en,
                        title_fr: lesson.title_fr,
                        content_ar: lesson.content_ar,
                        lesson_type: lesson.lesson_type,
                        xp_reward: lesson.xp_reward,
                        order_index: lesson.order_index
                    }))
                }
            }
        });

        console.log(`✅ Created: ${course.title_en} (${lessons.length} lessons, ${courseFields.xp_reward} XP)`);
    }

    console.log('\n🎉 All 8 courses seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
