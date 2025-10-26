import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetPasswords() {
  try {
    console.log("=== Resetting Employee Passwords ===");
    
    // สร้าง password hash ใหม่
    const newPassword = "123456";
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log(`Setting all employee passwords to: ${newPassword}`);
    
    // Reset password ของ employees ทั้งหมด
    const result = await prisma.employee.updateMany({
      where: {
        status: "active"
      },
      data: {
        passwordHash: hashedPassword,
        mustChangePassword: false
      }
    });
    
    console.log(`✅ Reset passwords for ${result.count} employees`);
    
    // แสดงรายการ employees ที่ reset password แล้ว
    const employees = await prisma.employee.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      },
      orderBy: { name: 'asc' }
    });
    

    
    console.log("\n📋 Employees with new passwords:");
    employees.forEach(emp => {
      console.log(`- ${emp.name} (${emp.email})`);
    });
    
    console.log(`\n🎉 All employees can now login with password: ${newPassword}`);
    console.log("Example login:");
    console.log(`Email: ${employees[0]?.email || 'any_active_employee@example.com'}`);
    console.log(`Password: ${newPassword}`);
    
  } catch (error) {
    console.error("❌ Error resetting passwords:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// รัน function ถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  resetPasswords();
}

export { resetPasswords };
