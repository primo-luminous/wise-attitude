import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkEmployees() {
  try {
    console.log("=== Checking Employee Data ===");
    
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        status: true
      }
    });
    
    console.log(`Found ${employees.length} employees:`);
    
    employees.forEach(emp => {
      console.log(`ID: ${emp.id}, Email: ${emp.email}, Name: ${emp.name}, Has Password: ${!!emp.passwordHash}, Status: ${emp.status}`);
    });
    
    // ตรวจสอบ employee ที่มี password hash
    const employeesWithPassword = employees.filter(emp => emp.passwordHash);
    console.log(`\nEmployees with password: ${employeesWithPassword.length}`);
    
    if (employeesWithPassword.length === 0) {
      console.log("❌ No employees have password hashes!");
      console.log("You need to create a test user with password first.");
    } else {
      console.log("✅ Found employees with passwords");
      
      // แสดงรายละเอียดของ employee ที่มี password
      employeesWithPassword.forEach(emp => {
        console.log(`- ${emp.name} (${emp.email}) - Status: ${emp.status}`);
      });
    }
    
  } catch (error) {
    console.error("Error checking employees:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// รัน function ถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  checkEmployees();
}

export { checkEmployees };
