import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log('Categories:', JSON.stringify(categories, null, 2));

  const courses = await prisma.course.findMany({
    include: {
      category: true,
    }
  });
  console.log('Courses count:', courses.length);
  courses.forEach(c => {
    console.log(`- [${c.id}] ${c.title_ar} (${c.category.slug})`);
  });

  const teachers = await prisma.teacher.findMany({
    include: {
      user: true
    }
  });
  console.log('Teachers:', teachers.map(t => `${t.id}: ${t.user.first_name} ${t.user.last_name}`).join(', '));
}

main().catch(err => console.error(err));
