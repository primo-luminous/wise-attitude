import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLogout() {
  try {
    console.log('=== Testing Logout System ===');
    
    // ตรวจสอบ session ที่ active อยู่
    const activeSessions = await prisma.userSession.findMany({
      where: { isActive: true },
      include: {
        employee: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    console.log(`Found ${activeSessions.length} active sessions:`);
    activeSessions.forEach(session => {
      console.log(`- ${session.employee.email} (${session.employee.name}) - Token: ${session.sessionToken.substring(0, 8)}...`);
    });
    
    // ตรวจสอบ session ที่หมดอายุ
    const expiredSessions = await prisma.userSession.findMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true
      },
      include: {
        employee: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    console.log(`\nFound ${expiredSessions.length} expired but still active sessions:`);
    expiredSessions.forEach(session => {
      console.log(`- ${session.employee.email} (${session.employee.name}) - Expired: ${session.expiresAt}`);
    });
    
    // ลบ session ที่หมดอายุ
    if (expiredSessions.length > 0) {
      const result = await prisma.userSession.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          isActive: true
        },
        data: { isActive: false }
      });
      console.log(`\nCleaned up ${result.count} expired sessions`);
    }
    
    console.log('\n=== Logout Test Complete ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogout();
