-- 1. Ensure Category
INSERT INTO "Category" (id, name_ar, name_en, name_fr, slug, icon, color)
VALUES (gen_random_uuid(), 'سكراتش', 'Scratch', 'Scratch', 'scratch', '🎨', '#4C97FF')
ON CONFLICT (slug) DO NOTHING;

-- 2. Ensure User (moha)
INSERT INTO "User" (id, email, password_hash, first_name, last_name, role, language, is_active, created_at)
VALUES (gen_random_uuid(), 'moha@kidtech.com', '$2b$10$YourHashedPasswordHere', 'Moha', 'Admin', 'ADMIN', 'ar', true, NOW())
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

-- 3. Ensure Teacher
INSERT INTO "Teacher" (id, user_id, bio, specialization)
SELECT gen_random_uuid(), id, 'Expert in Kids Tech', 'Scratch, Python'
FROM "User" WHERE email = 'moha@kidtech.com'
AND id NOT IN (SELECT user_id FROM "Teacher")
ON CONFLICT (user_id) DO NOTHING;

-- 4. Insert Course
INSERT INTO "Course" (id, category_id, teacher_id, title_ar, title_en, title_fr, description, difficulty, xp_reward, is_published, created_at)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM "Category" WHERE slug = 'scratch'),
    (SELECT id FROM "Teacher" WHERE user_id = (SELECT id FROM "User" WHERE email = 'moha@kidtech.com')),
    'برمجة سكراتش 3 للمبتدئين',
    'Scratch 3 Programming for Beginners',
    'Programmation Scratch 3 pour débutants',
    'تعلم أساسيات البرمجة مع سكراتش 3 وابدأ رحلتك في عالم الإبداع الرقمي.',
    'BEGINNER',
    100,
    true,
    NOW()
);

-- 5. Insert Lesson
INSERT INTO "Lesson" (id, course_id, title_ar, title_en, title_fr, content_ar, lesson_type, xp_reward, youtube_url, lab_url, guide_content, order_index)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM "Course" WHERE title_ar = 'برمجة سكراتش 3 للمبتدئين' LIMIT 1),
    'مقدمة في عالم سكراتش',
    'Introduction to Scratch World',
    'Introduction au monde Scratch',
    'في هذا الدرس سنتعرف على واجهة كيد تيك وسكراتش وكيفية تحريك الكائنات بشكل تفاعلي وممتع.',
    'VIDEO',
    100,
    'https://www.youtube.com/watch?v=kYJ-l2O2bHk',
    'https://stempedia.com/pictoblox-web/',
    '1. سجل دخولك لموقع سكراتش.
2. اختر كائناً جديداً من القائمة.
3. اسحب لبنة "عند نقر العلم الأخضر".
4. أضف لبنة "تحرك 10 خطوات".
5. اضغط على العلم لتجربة الحركة!',
    0
);
