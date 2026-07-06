import { prisma } from './config/database';

async function main() {
    console.log('--- Database Audit ---');
    try {
        const userCount = await prisma.user.count();
        console.log(`Total users: ${userCount}`);

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                is_active: true
            },
            take: 10
        });

        console.log('Recent Users:');
        console.table(users);

        const students = await prisma.student.count();
        console.log(`Total students: ${students}`);

        const teachers = await prisma.teacher.count();
        console.log(`Total teachers: ${teachers}`);

    } catch (error: any) {
        console.error('Error querying database:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
