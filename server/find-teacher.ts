import { prisma } from './src/config/database';

async function main() {
    try {
        const teacher = await prisma.teacher.findFirst({
            include: { user: true }
        });
        if (teacher) {
            console.log('TEACHER_ID_FOUND:', teacher.id);
            console.log('TEACHER_NAME:', teacher.user.first_name, teacher.user.last_name);
        } else {
            console.log('NO_TEACHER_FOUND');
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

main();
