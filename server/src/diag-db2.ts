import { prisma } from './config/database';

async function main() {
  const categories = await prisma.category.findMany();
  console.log('Categories:', JSON.stringify(categories, null, 2));

  const teachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          last_name: true,
          first_name: true
        }
      }
    }
  });
  console.log('Teachers:', JSON.stringify(teachers, null, 2));
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
