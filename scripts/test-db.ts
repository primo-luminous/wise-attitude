import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check departments
    const departments = await prisma.department.findMany();
    console.log(`📊 Found ${departments.length} departments:`, departments.map((d: any) => d.nameTh));
    
    // Check positions
    const positions = await prisma.position.findMany();
    console.log(`📊 Found ${positions.length} positions:`, positions.map((p: any) => p.nameTh));
    
    // Check employees
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
        position: true,
      }
    });
    console.log(`👥 Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.email}) - ${emp.department?.nameTh} / ${emp.position?.nameTh}`);
    });
    
    // Test specific employee
    const admin = await prisma.employee.findUnique({
      where: { email: 'admin@wiseattitude.com' },
      include: { department: true, position: true }
    });
    
    if (admin) {
      console.log('✅ Admin user found:', {
        name: admin.name,
        email: admin.email,
        status: admin.status,
        department: admin.department?.nameTh,
        position: admin.position?.nameTh
      });
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
