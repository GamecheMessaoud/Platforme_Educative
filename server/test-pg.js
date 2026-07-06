const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_WcbTpaJLe6i1@ep-bold-wind-aib34j03-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function testCategory() {
    try {
        await client.connect();

        // Test Category Creation
        const slug = 'mobile-dev';
        const nameAr = 'تطبيقات الهاتف';

        let res = await client.query('SELECT * FROM "Category" WHERE slug = $1', [slug]);
        let category = res.rows[0];

        if (!category) {
            console.log('Creating category manually...');
            res = await client.query(
                'INSERT INTO "Category" (slug, name_ar, name_en, name_fr, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
                [slug, nameAr, nameAr, nameAr]
            );
            category = res.rows[0];
        }

        console.log('Category Found/Created:', category);

        // Find Teacher User
        res = await client.query('SELECT * FROM "User" WHERE role = $1 LIMIT 1', ['TEACHER']);
        const teacherUser = res.rows[0];

        if (!teacherUser) {
            console.log('No teacher user found in DB');
            return;
        }

        let teacherRes = await client.query('SELECT * FROM "Teacher" WHERE user_id = $1', [teacherUser.id]);
        let teacher = teacherRes.rows[0];

        if (!teacher) {
            console.log('Creating Teacher Profile...');
            teacherRes = await client.query(
                'INSERT INTO "Teacher" (user_id, specialization, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING *',
                [teacherUser.id, 'General']
            );
            teacher = teacherRes.rows[0];
        }

        console.log('Teacher Profile:', teacher);

        console.log('Inserting Course...');
        const courseRes = await client.query(
            'INSERT INTO "Course" (title_ar, title_en, title_fr, description, thumbnail_url, category_id, teacher_id, is_published, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *',
            ['Test Course', 'Test Course', 'Test Course', 'Test Description', '', category.id, teacher.id, false]
        );

        console.log('Course successfully created:', courseRes.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

testCategory();
