import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'admin@gmail.com';
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.upsert({
        where: { email },
        update: { password_hash: hash, role: 'ADMIN' },
        create: {
            email,
            password_hash: hash,
            first_name: 'Admin',
            last_name: 'KidTech',
            role: 'ADMIN',
        }
    });

    // Ensure teacher profile exists
    await prisma.teacher.upsert({
        where: { user_id: user.id },
        update: {},
        create: {
            user_id: user.id,
            bio: 'Platform Administrator',
            specialization: 'All'
        }
    });

    console.log('✅ Admin account ready!');
    console.log(`   📧 Email:    ${email}`);
    console.log(`   🔑 Password: ${password}`);
    console.log(`   👤 Role:     ADMIN`);
}

main()
    .catch(e => { console.error('❌', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
