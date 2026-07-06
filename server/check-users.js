const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Audit (JS) ---');
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
            take: 20
        });

        console.log('User Records:');
        console.table(users);

        for (const user of users) {
            const student = await prisma.student.findUnique({ where: { user_id: user.id } });
            const teacher = await prisma.teacher.findUnique({ where: { user_id: user.id } });
            console.log(`User: ${user.email} | Role: ${user.role} | Student: ${!!student} | Teacher: ${!!teacher}`);
        }

    } catch (error) {
        console.error('Error querying database:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
