import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export interface SessionData {
  id: number;
  employeeID: string;
  email: string;
  name: string;
  nickname: string;
  department: string;
  position: string;
  imageUrl: string | null;
  mustChangePassword: boolean;
  titlePrefix: string | null;
  ppPhone: string | null;
  wPhone: string | null;
  birthday: string | null;
  departmentId: number | null;
  positionId: number | null;
  address: string | null;
  dayOff: string | null;
  educationLevel: string | null;
  university: string | null;
  major: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  socialSecurityStart: string | null;
}

// ลบ generateDeviceId function - ไม่ใช้แล้ว

// สร้าง session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// สร้าง session ใหม่
export async function createSession(employeeId: number, rememberMe: boolean = false) {
  const sessionToken = generateSessionToken();
  
  // ตั้งเวลาหมดอายุ - 30 วันถ้า remember me, 1 ชั่วโมงถ้าไม่
  const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000));
  
  // ไม่ลบ session เก่า - อนุญาตให้ login ได้หลายเครื่อง
  // await prisma.userSession.updateMany({
  //   where: { 
  //     employeeId,
  //     isActive: true 
  //   },
  //   data: { 
  //     isActive: false 
  //   }
  // });
  
  // สร้าง session ใหม่
  const session = await prisma.userSession.create({
    data: {
      employeeId,
      sessionToken,
      userAgent: "legacy", // ใช้ค่า legacy เพื่อความเข้ากันได้
      ipAddress: "legacy", // ใช้ค่า legacy เพื่อความเข้ากันได้
      expiresAt,
      isActive: true
    }
  });
  
  return session;
}

// ตรวจสอบ session
export async function validateSession(sessionToken: string): Promise<SessionData | null> {
  try {
    console.log("🔍 validateSession - Looking for session with token:", sessionToken.substring(0, 10) + "...");
    
    // ทำการ cleanup session ที่หมดอายุก่อน
    await cleanupExpiredSessions();
    
    // ตรวจสอบ session ทั้งหมด (รวมทั้งที่ inactive) เพื่อ debug
    const allSessions = await prisma.userSession.findMany({
      where: { sessionToken },
      select: { id: true, isActive: true, expiresAt: true, createdAt: true, employeeId: true }
    });
    
    console.log("🔍 validateSession - All sessions with this token:", allSessions);
    
    const session = await prisma.userSession.findUnique({
      where: { 
        sessionToken,
        isActive: true 
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true
          }
        }
      }
    });
    
    if (!session) {
      console.log("❌ validateSession - No active session found");
      
      // ตรวจสอบว่ามี session ที่ไม่ active หรือไม่
      const inactiveSession = await prisma.userSession.findUnique({
        where: { sessionToken },
        select: { id: true, isActive: true, expiresAt: true, createdAt: true }
      });
      
      if (inactiveSession) {
        console.log("🔍 validateSession - Found inactive session:", {
          id: inactiveSession.id,
          isActive: inactiveSession.isActive,
          expired: new Date() > inactiveSession.expiresAt,
          expiresAt: inactiveSession.expiresAt,
          createdAt: inactiveSession.createdAt
        });
      } else {
        console.log("🔍 validateSession - No session found with this token at all");
      }
      
      return null;
    }
    
    console.log("🔍 validateSession - Session found for employee:", session.employee.email);
    
    // ตรวจสอบว่า session หมดอายุหรือไม่
    if (new Date() > session.expiresAt) {
      console.log("❌ validateSession - Session expired, deactivating");
      await prisma.userSession.update({
        where: { id: session.id },
        data: { isActive: false }
      });
      return null;
    }
    
    console.log("✅ validateSession - Session is still valid, expires at:", session.expiresAt);
    
    // ลบการตรวจสอบ device fingerprint - อนุญาตให้ login ได้หลายเครื่อง
    
    // ตรวจสอบว่า user ยัง active อยู่หรือไม่
    if (session.employee.status !== 'active') {
      await prisma.userSession.update({
        where: { id: session.id },
        data: { isActive: false }
      });
      return null;
    }
    
    // Auto-refresh session ถ้าใกล้หมดอายุ (เหลือน้อยกว่า 15 นาที)
    const timeLeft = session.expiresAt.getTime() - new Date().getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    
    if (timeLeft < fifteenMinutes) {
      // ขยายเวลา session - 30 วันถ้าเป็น long-term session, 1 ชั่วโมงถ้าไม่
      const isLongTermSession = session.expiresAt.getTime() - session.createdAt.getTime() > 24 * 60 * 60 * 1000; // มากกว่า 1 วัน
      const newExpiresAt = new Date(Date.now() + (isLongTermSession ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000));
      
      await prisma.userSession.update({
        where: { id: session.id },
        data: { 
          expiresAt: newExpiresAt,
          lastActivity: new Date()
        }
      });
      
      console.log("Session auto-refreshed for user:", session.employee.email);
    } else {
      // อัพเดท lastActivity เฉพาะเมื่อจำเป็น (ไม่ใช่ทุกครั้ง)
      const timeSinceLastActivity = new Date().getTime() - session.lastActivity.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeSinceLastActivity > fiveMinutes) {
        await prisma.userSession.update({
          where: { id: session.id },
          data: { lastActivity: new Date() }
        });
      }
    }
    
    // สร้าง session data
    return {
      id: session.employee.id,
      employeeID: session.employee.employeeID,
      email: session.employee.email,
      name: session.employee.name,
      nickname: session.employee.nickname || "",
      department: session.employee.department?.nameTh || "",
      position: session.employee.position?.nameTh || "",
      imageUrl: session.employee.imageUrl,
      mustChangePassword: session.employee.mustChangePassword,
      titlePrefix: session.employee.titlePrefix,
      ppPhone: session.employee.ppPhone,
      wPhone: session.employee.wPhone,
      birthday: session.employee.birthday ? session.employee.birthday.toISOString().slice(0, 10) : null,
      departmentId: session.employee.departmentId,
      positionId: session.employee.positionId,
      address: session.employee.address,
      dayOff: session.employee.dayOff,
      educationLevel: session.employee.educationLevel,
      university: session.employee.university,
      major: session.employee.major,
      bankName: session.employee.bankName,
      bankAccountNumber: session.employee.bankAccountNumber,
      socialSecurityStart: session.employee.socialSecurityStart ? session.employee.socialSecurityStart.toISOString().slice(0, 10) : null,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

// ลบ session
export async function deleteSession(sessionToken: string) {
  try {
    await prisma.userSession.updateMany({
      where: { sessionToken },
      data: { isActive: false }
    });
  } catch (error) {
    console.error('Delete session error:', error);
  }
}

// ลบ session ที่หมดอายุ
export async function cleanupExpiredSessions() {
  try {
    await prisma.userSession.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true
      },
      data: { isActive: false }
    });
  } catch (error) {
    console.error('Cleanup expired sessions error:', error);
  }
}

// ตรวจสอบว่ามี session อื่นที่ active อยู่หรือไม่
export async function hasOtherActiveSessions(employeeId: number, currentSessionId: string): Promise<boolean> {
  try {
    const count = await prisma.userSession.count({
      where: {
        employeeId,
        isActive: true,
        id: { not: currentSessionId }
      }
    });
    return count > 0;
  } catch (error) {
    console.error('Check other sessions error:', error);
    return false;
  }
}

// Refresh session และ extend expire time
export async function refreshSession(sessionToken: string): Promise<boolean> {
  try {
    const session = await prisma.userSession.findUnique({
      where: { 
        sessionToken,
        isActive: true 
      }
    });
    
    if (!session) {
      return false;
    }
    
    // ตรวจสอบว่า session หมดอายุหรือไม่
    if (new Date() > session.expiresAt) {
      await prisma.userSession.update({
        where: { id: session.id },
        data: { isActive: false }
      });
      return false;
    }
    
    // Extend expire time - 30 วันถ้าเป็น long-term session, 1 ชั่วโมงถ้าไม่
    const isLongTermSession = session.expiresAt.getTime() - session.createdAt.getTime() > 24 * 60 * 60 * 1000; // มากกว่า 1 วัน
    const newExpiresAt = new Date(Date.now() + (isLongTermSession ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000));
    
    await prisma.userSession.update({
      where: { id: session.id },
      data: { 
        expiresAt: newExpiresAt,
        lastActivity: new Date()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Refresh session error:', error);
    return false;
  }
}

// ตรวจสอบ session ที่ใกล้หมดอายุ (เหลือน้อยกว่า 10 นาที)
export async function isSessionNearExpiry(sessionToken: string): Promise<boolean> {
  try {
    const session = await prisma.userSession.findUnique({
      where: { 
        sessionToken,
        isActive: true 
      }
    });
    
    if (!session) {
      return true;
    }
    
    const now = new Date();
    const timeLeft = session.expiresAt.getTime() - now.getTime();
    const tenMinutes = 10 * 60 * 1000; // 10 นาที
    
    return timeLeft < tenMinutes;
  } catch (error) {
    console.error('Check session expiry error:', error);
    return true;
  }
}
