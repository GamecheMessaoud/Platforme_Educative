const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const subs = await prisma.submission.findMany({
        include: { student: { include: { user: true } } }
    });
    console.log(JSON.stringify(subs, null, 2));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
