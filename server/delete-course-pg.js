const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        const res = await pool.query(`SELECT id, title_ar FROM "Course" WHERE title_ar LIKE $1`, ['%تعلم أساسيات البرم%']);
        if (res.rows.length > 0) {
            console.log('Found courses:', res.rows);
            for (const row of res.rows) {
                console.log(`Deleting course: ${row.title_ar} (${row.id})`);
                // Prisma cascade delete is on the DB level if configured, otherwise we might need to delete relations.
                // Let's try deleting directly, if foreign key constraint fails, we'll see.
                await pool.query(`DELETE FROM "Course" WHERE id = $1`, [row.id]);
                console.log('Deleted successfully.');
            }
        } else {
            console.log('Course not found with exact title, searching for anything with "تعلم"');
            const res2 = await pool.query(`SELECT id, title_ar FROM "Course" WHERE title_ar LIKE $1`, ['%تعلم%']);
            console.log('Found alternatives:', res2.rows);
            for (const row of res2.rows) {
                if (row.title_ar.includes('أساسيات')) {
                    console.log(`Deleting course: ${row.title_ar} (${row.id})`);
                    await pool.query(`DELETE FROM "Course" WHERE id = $1`, [row.id]);
                    console.log('Deleted successfully.');
                }
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

main();
