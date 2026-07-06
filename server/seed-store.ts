import { prisma } from './src/config/database';

async function main() {
    console.log('Seeding store categories...');

    const categories = [
        { name_ar: 'كتب تعليمية', slug: 'books', icon: '📚' },
        { name_ar: 'كتب إلكترونية', slug: 'ebooks', icon: '📱' },
        { name_ar: 'حقائب تعليمية', slug: 'kits', icon: '🎁' },
        { name_ar: 'روبوتات', slug: 'robots', icon: '🤖' }
    ];

    for (const c of categories) {
        await prisma.storeCategory.upsert({
            where: { slug: c.slug },
            update: { name_ar: c.name_ar, icon: c.icon },
            create: c
        });
    }

    console.log('✅ Store categories seeded');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
