import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { nameEn: 'IT' },
      update: {},
      create: {
        nameEn: 'IT',
        nameTh: 'เทคโนโลยีสารสนเทศ',
        description: 'แผนกเทคโนโลยีสารสนเทศ'
      }
    }),
    prisma.department.upsert({
      where: { nameEn: 'HR' },
      update: {},
      create: {
        nameEn: 'HR',
        nameTh: 'ทรัพยากรบุคคล',
        description: 'แผนกทรัพยากรบุคคล'
      }
    }),
    prisma.department.upsert({
      where: { nameEn: 'Finance' },
      update: {},
      create: {
        nameEn: 'Finance',
        nameTh: 'การเงิน',
        description: 'แผนกการเงิน'
      }
    })
  ]);

  console.log('✅ Departments created');

  // Create positions
  const positions = await Promise.all([
    prisma.position.upsert({
      where: { nameEn: 'Manager' },
      update: {},
      create: {
        nameEn: 'Manager',
        nameTh: 'ผู้จัดการ',
        description: 'ตำแหน่งผู้จัดการ',
        level: 3
      }
    }),
    prisma.position.upsert({
      where: { nameEn: 'Senior Developer' },
      update: {},
      create: {
        nameEn: 'Senior Developer',
        nameTh: 'นักพัฒนาระดับอาวุโส',
        description: 'ตำแหน่งนักพัฒนาระดับอาวุโส',
        level: 2
      }
    }),
    prisma.position.upsert({
      where: { nameEn: 'Developer' },
      update: {},
      create: {
        nameEn: 'Developer',
        nameTh: 'นักพัฒนา',
        description: 'ตำแหน่งนักพัฒนา',
        level: 1
      }
    })
  ]);

  console.log('✅ Positions created');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create employees
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { email: 'admin@wiseattitude.com' },
      update: {},
      create: {
        employeeID: 'EMP001',
        name: 'ผู้ดูแลระบบ',
        nickname: 'แอดมิน',
        email: 'admin@wiseattitude.com',
        passwordHash: hashedPassword,
        mustChangePassword: false,
        status: 'active',
        departmentId: departments[0].id, // IT
        positionId: positions[0].id, // Manager
        ppPhone: '0812345678',
        wPhone: '021234567'
      }
    }),
    prisma.employee.upsert({
      where: { email: 'john.doe@wiseattitude.com' },
      update: {},
      create: {
        employeeID: 'EMP002',
        name: 'จอห์น โด',
        nickname: 'จอห์น',
        email: 'john.doe@wiseattitude.com',
        passwordHash: hashedPassword,
        mustChangePassword: true, // Force password change
        status: 'active',
        departmentId: departments[0].id, // IT
        positionId: positions[1].id, // Senior Developer
        ppPhone: '0823456789',
        wPhone: '022345678'
      }
    }),
    prisma.employee.upsert({
      where: { email: 'jane.smith@wiseattitude.com' },
      update: {},
      create: {
        employeeID: 'EMP003',
        name: 'เจน สมิธ',
        nickname: 'เจน',
        email: 'jane.smith@wiseattitude.com',
        passwordHash: hashedPassword,
        mustChangePassword: false,
        status: 'active',
        departmentId: departments[1].id, // HR
        positionId: positions[0].id, // Manager
        ppPhone: '0834567890',
        wPhone: '023456789'
      }
    })
  ]);

  console.log('✅ Employees created');

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📋 Test accounts:');
  console.log('Admin: admin@wiseattitude.com / password123');
  console.log('John: john.doe@wiseattitude.com / password123 (must change password)');
  console.log('Jane: jane.smith@wiseattitude.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
