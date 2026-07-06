import { prisma } from './src/config/database';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🚀 Restoring critical user data...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);

    // 1. Restore Teacher (borhan@gmail.com)
    const borhan = await prisma.user.upsert({
        where: { email: 'borhan@gmail.com' },
        update: {},
        create: {
            email: 'borhan@gmail.com',
            password_hash: hashedPassword,
            first_name: 'borhan',
            last_name: 'Teacher',
            role: 'TEACHER' as any,
            is_active: true,
            teacherProfile: {
                create: {
                    id: 'fa4ef408-c364-43c1-944c-7a2882cd65a0',
                    bio: 'مدرس متخصص في البرمجة والذكاء الاصطناعي',
                    specialization: 'Computer Science'
                }
            }
        }
    });
    console.log('✅ Teacher Borhan restored.');

    // 2. Restore a Demo Student
    await prisma.user.upsert({
        where: { email: 'student@gmail.com' },
        update: {},
        create: {
            email: 'student@gmail.com',
            password_hash: hashedPassword,
            first_name: 'طالب',
            last_name: 'مثال',
            role: 'STUDENT' as any,
            is_active: true,
            studentProfile: {
                create: {
                    total_xp: 500,
                    current_level: 2,
                    current_streak: 3,
                    placement_completed: true,
                    skill_level: 'BEGINNER'
                }
            }
        }
    });
    console.log('✅ Student Demo restored.');

    console.log('🎉 Recovery complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
