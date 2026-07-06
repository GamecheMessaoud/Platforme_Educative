const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('(Password is whatever you originally set, or you can reset it)');
      return;
    }

    const hash = await bcrypt.hash('admin123', 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@sadeem.com',
        password_hash: hash,
        first_name: 'Admin',
        last_name: 'Sadeem',
        role: 'ADMIN',
      },
    });

    console.log('Admin created successfully!');
    console.log('Email: admin@sadeem.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
