const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
    try {
        console.log('Testing user creation...');
        const email = 'diag_' + Date.now() + '@example.com';
        const user = await prisma.user.create({
            data: {
                email: email,
                password_hash: 'test_hash',
                first_name: 'Test',
                last_name: 'User',
                role: 'STUDENT'
            }
        });
        console.log('User created:', user.id);

        console.log('Testing student profile creation...');
        const student = await prisma.student.create({
            data: {
                user_id: user.id,
                skill_level: 'BEGINNER'
            }
        });
        console.log('Student created:', student.id);

    } catch (e) {
        console.error('DIAGNOSTIC ERROR:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

test();
