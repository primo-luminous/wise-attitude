import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log("=== Testing Login System ===");
    
    // ทดสอบ login ด้วย email และ password ที่เป็นไปได้
    const testEmails = [
      "gift@bestlivingcondo.com",
      "pumpui@bestlivingcondo.com", 
      "pock@bestlivingcondo.com",
      "tang@bestlivingcondo.com",
      "touch@bestlivingcondo.com"
    ];
    
    const testPasswords = [
      "123456",
      "password",
      "password123",
      "admin",
      "admin123",
      "12345678",
      "qwerty",
      "123456789"
    ];
    
    for (const email of testEmails) {
      console.log(`\n🔍 Testing email: ${email}`);
      
      try {
        const employee = await prisma.employee.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            passwordHash: true,
            status: true
          }
        });
        
        if (!employee) {
          console.log("❌ Employee not found");
          continue;
        }
        
        console.log(`✅ Found employee: ${employee.name} (ID: ${employee.id})`);
        console.log(`Status: ${employee.status}`);
        console.log(`Has password hash: ${!!employee.passwordHash}`);
        
        // ทดสอบ password ที่เป็นไปได้
        for (const password of testPasswords) {
          try {
            const isPasswordValid = await bcrypt.compare(password, employee.passwordHash);
            if (isPasswordValid) {
              console.log(`🎉 SUCCESS! Password found: "${password}"`);
              console.log(`You can login with: ${email} / ${password}`);
              return; // หยุดเมื่อเจอ password ที่ถูกต้อง
            }
          } catch (error) {
            console.log(`Error testing password "${password}":`, error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : String(error));
          }
        }
        
        console.log("❌ No matching password found");
        
      } catch (error) {
        console.log(`Error finding employee:`, error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : String(error));
      }
    }
    
    console.log("\n❌ No valid login credentials found");
    console.log("You may need to reset passwords or check the database");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// รัน test ถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  testLogin();
}

export { testLogin };
