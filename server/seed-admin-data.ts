import { prisma } from './src/config/database';

async function main() {
    console.log('Seeding admin data...');

    // 1. Initial System Settings
    const settings = [
        { key: 'xp_multiplier', value: '1.5' },
        { key: 'maintenance_mode', value: 'false' },
        { key: 'platform_name', value: 'KidTech Learn' }
    ];

    for (const s of settings) {
        await prisma.systemSetting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: s
        });
    }

    // 2. Products
    const products = [
        { name_ar: 'حقيبة برمجة أردوينو', price: 49.99, stock: 15, category: 'HARDWARE' },
        { name_ar: 'مجموعة حساسات ذكية', price: 25.50, stock: 30, category: 'HARDWARE' },
        { name_ar: 'رخصة Scratch برو', price: 9.99, stock: 999, category: 'SOFTWARE' }
    ];

    for (const p of products) {
        await prisma.product.create({ data: p });
    }

    // 3. Get any student for mock payments
    const student = await prisma.student.findFirst();
    if (student) {
        await prisma.payment.create({
            data: {
                student_id: student.id,
                amount: 49.99,
                status: 'COMPLETED',
                payment_method: 'STRIPE',
                transaction_id: 'tx_' + Math.random().toString(36).substr(2, 9)
            }
        });
        await prisma.payment.create({
            data: {
                student_id: student.id,
                amount: 9.99,
                status: 'COMPLETED',
                payment_method: 'XP',
                transaction_id: 'tx_xp_' + Math.random().toString(36).substr(2, 9)
            }
        });
    }

    console.log('✅ Admin data seeded successfully');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
