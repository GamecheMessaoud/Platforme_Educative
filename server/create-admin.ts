import { prisma } from './src/config/database';
import { hashPassword } from './src/utils/password';

async function main() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    const hash = await hashPassword('admin123');

    if (existingAdmin) {
      // Force update password
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password_hash: hash }
      });
      console.log('✅ Admin password forcefully reset!');
      console.log('Email:', existingAdmin.email);
      console.log('Password: admin123');
      return;
    }

    // If no admin exists at all
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@sadeem.com',
        password_hash: hash,
        first_name: 'Admin',
        last_name: 'Sadeem',
        role: 'ADMIN',
      },
    });

    console.log('✅ New Admin created!');
    console.log('Email:', newAdmin.email);
    console.log('Password: admin123');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
