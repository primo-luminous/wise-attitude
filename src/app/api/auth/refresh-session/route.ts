import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";
import { refreshSession } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ 
        status: "error", 
        message: "ไม่พบ session ที่ใช้งานได้" 
      }, { status: 401 });
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ 
        status: "error", 
        message: "ไม่พบ session token" 
      }, { status: 401 });
    }

    // Refresh session
    const success = await refreshSession(sessionToken);
    
    if (!success) {
      return NextResponse.json({ 
        status: "error", 
        message: "ไม่สามารถ refresh session ได้" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      status: "success", 
      message: "Session ถูก refresh แล้ว",
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Refresh session error:", error);
    return NextResponse.json({ 
      status: "error", 
      message: "เกิดข้อผิดพลาดในการ refresh session" 
    }, { status: 500 });
  }
}
