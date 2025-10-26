import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupAllSessions() {
  try {
    console.log('=== Cleaning Up All Sessions ===');
    
    // ลบ session ทั้งหมดที่ active อยู่
    const result = await prisma.userSession.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });
    
    console.log(`Cleaned up ${result.count} active sessions`);
    
    // ตรวจสอบ session ที่เหลือ
    const remainingSessions = await prisma.userSession.findMany({
      where: { isActive: true }
    });
    
    console.log(`Remaining active sessions: ${remainingSessions.length}`);
    
    if (remainingSessions.length === 0) {
      console.log('✅ All sessions have been cleaned up successfully!');
      console.log('Now you can test the logout functionality.');
    }
    
  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAllSessions();
