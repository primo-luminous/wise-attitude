import { PrismaClient } from "@prisma/client";
import { createSession, validateSession, deleteSession } from "../lib/session";

const prisma = new PrismaClient();

async function testSessionManagement() {
  try {
    console.log("=== Testing Session Management System ===");
    
    // 1. ทดสอบการสร้าง session
    console.log("\n1. Testing Session Creation...");
    const testEmployeeId = 1; // เปลี่ยนเป็น ID ที่มีอยู่จริงในฐานข้อมูล
    const testUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    const testIpAddress = "192.168.1.100";
    
    const session = await createSession(testEmployeeId, testUserAgent, testIpAddress);
    console.log("✅ Session created:", {
      id: session.id,
      sessionToken: session.sessionToken.substring(0, 16) + "...",
      deviceId: session.deviceId.substring(0, 16) + "...",
      expiresAt: session.expiresAt
    });
    
    // 2. ทดสอบการ validate session
    console.log("\n2. Testing Session Validation...");
    const sessionData = await validateSession(session.sessionToken, testUserAgent, testIpAddress);
    
    if (sessionData) {
      console.log("✅ Session validated successfully:", {
        employeeId: sessionData.id,
        name: sessionData.name,
        email: sessionData.email
      });
    } else {
      console.log("❌ Session validation failed");
    }
    
    // 3. ลบการทดสอบ device fingerprinting - ไม่ใช้แล้ว
    console.log("\n3. Device fingerprinting removed - users can now login from multiple devices");
    
    // 4. ลบการทดสอบ device validation - ไม่ใช้แล้ว
    console.log("\n4. Device validation removed - sessions work from any device");
    
    // 5. ทดสอบการลบ session
    console.log("\n5. Testing Session Deletion...");
    await deleteSession(session.sessionToken);
    console.log("✅ Session deleted");
    
    // 6. ทดสอบการ validate session ที่ถูกลบแล้ว
    console.log("\n6. Testing Validation of Deleted Session...");
    const deletedSessionData = await validateSession(session.sessionToken, testUserAgent, testIpAddress);
    
    if (!deletedSessionData) {
      console.log("✅ Deleted session correctly rejected");
    } else {
      console.log("❌ Deleted session should have been rejected");
    }
    
    // 7. ทดสอบการสร้าง session ใหม่ (ควรลบ session เก่าทั้งหมด)
    console.log("\n7. Testing New Session Creation (should clear old sessions)...");
    const newSession = await createSession(testEmployeeId, testUserAgent, testIpAddress);
    console.log("✅ New session created:", {
      id: newSession.id,
      sessionToken: newSession.sessionToken.substring(0, 16) + "..."
    });
    
    // 8. ตรวจสอบว่า session เก่าถูกลบแล้ว
    console.log("\n8. Verifying Old Sessions Are Cleared...");
    const oldSessionCount = await prisma.userSession.count({
      where: {
        employeeId: testEmployeeId,
        isActive: true,
        id: { not: newSession.id }
      }
    });
    
    if (oldSessionCount === 0) {
      console.log("✅ Old sessions correctly cleared");
    } else {
      console.log(`❌ Found ${oldSessionCount} old active sessions`);
    }
    
    // 9. Cleanup
    console.log("\n9. Cleaning up test data...");
    await deleteSession(newSession.sessionToken);
    console.log("✅ Test cleanup completed");
    
    console.log("\n=== All Tests Completed Successfully! ===");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// รัน test ถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  testSessionManagement();
}

export { testSessionManagement };
