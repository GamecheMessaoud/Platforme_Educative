const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_WcbTpaJLe6i1@ep-bold-wind-aib34j03-pooler.c-4.us-east-1.aws-neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
    const client = new Client({ connectionString });
    await client.connect();
    console.log('--- Connected to DB ---');

    try {
        // Correct quoting for Prisma-generated PostgreSQL tables
        const titleToDelete = 'برمجة سكراتش 3 للمبتدئين';
        const res1 = await client.query('DELETE FROM "Course" WHERE "title" = $1', [titleToDelete]);
        console.log(`Deleted by title: ${res1.rowCount} rows`);

        const res2 = await client.query('DELETE FROM "Course" WHERE "studentsCount" = 1245 OR "rating" = 4.8');
        console.log(`Deleted by stats: ${res2.rowCount} rows`);

    } finally {
        await client.end();
    }
}

main().catch(console.error);
