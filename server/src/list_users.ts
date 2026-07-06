import { prisma } from './config/database';

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                first_name: true,
                last_name: true
            }
        });
        console.log('--- USER LIST ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('-----------------');
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
