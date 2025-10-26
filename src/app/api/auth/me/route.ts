// app/api/me/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { validateSession } from "@/lib/session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    
    console.log("🔍 /api/auth/me - Token exists:", !!token);
    
    if (!token) {
      console.log("❌ /api/auth/me - No session token found");
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    const hdrs = await headers();
    const ua = hdrs.get("user-agent") || "";
    const fwd = hdrs.get("x-forwarded-for");
    const rip = hdrs.get("x-real-ip");
    const ip = fwd || rip || "unknown";

    console.log("🔍 /api/auth/me - Validating session with token:", token.substring(0, 10) + "...");
    console.log("🔍 /api/auth/me - User Agent:", ua.substring(0, 50) + "...");
    console.log("🔍 /api/auth/me - IP:", ip);

    const user = await validateSession(token);
    
    if (!user) {
      console.log("❌ /api/auth/me - Session validation failed");
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    console.log("✅ /api/auth/me - Session validated successfully for user:", user.email);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("❌ /api/auth/me - Error:", error);
    return NextResponse.json({ ok: false, user: null }, { status: 500 });
  }
}
