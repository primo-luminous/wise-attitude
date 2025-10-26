import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ session token โดยตรง
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ 
        status: "expired", 
        message: "ไม่พบ session token" 
      }, { status: 401 });
    }

    // Get headers for device fingerprint
    const userAgent = request.headers.get("user-agent") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor || realIp || "unknown";

    // Validate session โดยตรง
    const sessionData = await validateSession(sessionToken);
    
    if (!sessionData) {
      return NextResponse.json({ 
        status: "expired", 
        message: "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่" 
      }, { status: 401 });
    }

    // ไม่ตรวจสอบ session อื่น - อนุญาตให้ login ได้หลายเครื่อง
    // const otherSessions = await prisma.userSession.findMany({
    //   where: {
    //     employeeId: sessionData.id,
    //     isActive: true,
    //     id: { not: request.headers.get("x-session-id") || "" }
    //   },
    //   orderBy: { lastActivity: "desc" }
    // });

    // if (otherSessions.length > 0) {
    //   // มีการ login จากที่อื่น - kick out session ปัจจุบัน
    //   cookieStore.delete("session_token");
      
    //   return NextResponse.json({ 
    //     status: "kicked_out", 
    //     message: "มีการเข้าสู่ระบบจากที่อื่น บัญชีของคุณถูกออกจากระบบ",
    //     otherDevice: {
    //       userAgent: otherSessions[0].userAgent,
    //       ipAddress: otherSessions[0].ipAddress,
    //       lastActivity: otherSessions[0].lastActivity
    //     }
    //   }, { status: 403 });
    // }

    return NextResponse.json({ 
      status: "active", 
      user: {
        id: sessionData.id,
        name: sessionData.name,
        nickname: sessionData.nickname,
        email: sessionData.email
      }
    });

  } catch (error) {
    console.error("Session status check error:", error);
    return NextResponse.json({ 
      status: "error", 
      message: "เกิดข้อผิดพลาดในการตรวจสอบ session" 
    }, { status: 500 });
  }
}
