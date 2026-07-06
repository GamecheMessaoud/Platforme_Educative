import { prisma } from './src/config/database';

async function main() {
    try {
        const teachers = await prisma.teacher.findMany({
            include: {
                user: true,
                courses: true
            }
        });

        console.log('--- TEACHERS AND COURSES ---');
        teachers.forEach(t => {
            console.log(`Teacher: ${t.user.first_name} ${t.user.last_name} (ID: ${t.id}, UserID: ${t.user_id})`);
            console.log(`Courses Count: ${t.courses.length}`);
            t.courses.forEach(c => {
                console.log(` - ${c.title_ar} (${c.id})`);
            });
            console.log('---------------------------');
        });

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

main();
