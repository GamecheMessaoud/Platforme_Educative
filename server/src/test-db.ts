import { prisma } from './config/database';

async function main() {
    console.log('--- Database Verification ---');
    try {
        const userCount = await prisma.user.count();
        console.log(`Total users: ${userCount}`);

        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true },
            take: 5
        });
        console.table(users);
    } catch (e: any) {
        console.error('Database connection failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
