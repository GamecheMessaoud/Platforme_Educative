const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        const res = await pool.query(`SELECT id, title_ar FROM "Course" WHERE title_ar LIKE $1`, ['%برمجة سكراتش%']);
        if (res.rows.length > 0) {
            console.log('Found courses:', res.rows);
            for (const row of res.rows) {
                if (row.title_ar.includes('للمبتدئين')) {
                    console.log(`Deleting course: ${row.title_ar} (${row.id})`);
                    await pool.query(`DELETE FROM "Course" WHERE id = $1`, [row.id]);
                    console.log('Deleted successfully.');
                }
            }
        } else {
            console.log('Course not found.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

main();
