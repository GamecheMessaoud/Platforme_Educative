import { prisma } from './config/database';
import { hashPassword } from './utils/password';

async function main() {
    const password = 'password123';
    const hashedPassword = await hashPassword(password);

    console.log('Resetting passwords to "password123" for:');
    const users = ['admin@gmail.com', 'borhan@gmail.com', 'Mohamed@gmail.com', 'student@gmail.com'];

    for (const email of users) {
        await prisma.user.update({
            where: { email },
            data: { password_hash: hashedPassword }
        });
        console.log(`- ${email}`);
    }

    console.log('\nAll passwords updated to "password123".');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
