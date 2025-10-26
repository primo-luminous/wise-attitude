"use server";

import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { createSession, validateSession, deleteSession, SessionData } from "@/lib/session";

const prisma = new PrismaClient();

export async function signInAction(prevState: { success: boolean; error: string | null }, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const from = String(formData.get("from") || "/main");
  const remember = formData.get("remember") === "on";

  // Validate input
  if (!email || !password) {
    return { success: false, error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  }

  try {
    // Find employee by email
    const employee = await prisma.employee.findUnique({
      where: { email },
      include: {
        department: true,
        position: true,
      },
    });

    if (!employee) {
      return { success: false, error: "ไม่พบผู้ใช้นี้ในระบบ" };
    }

    // Check if employee is active
    if (employee.status !== "active") {
      return { success: false, error: "บัญชีผู้ใช้ถูกระงับการใช้งาน" };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.passwordHash);
    
    if (!isPasswordValid) {
      return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };
    }

    // ตรวจสอบว่ารหัสผ่านเป็น 1234567890 หรือไม่
    const isDefaultPassword = await bcrypt.compare("1234567890", employee.passwordHash);
    if (isDefaultPassword) {
      // บังคับให้เปลี่ยนรหัสผ่านถ้าเป็นรหัสเริ่มต้น
      employee.mustChangePassword = true;
    }

    // Get headers for device fingerprint
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ipAddress = forwardedFor || realIp || "unknown";

    // Create new session with remember me option
    const session = await createSession(employee.id, remember);

    // Create session data
    const sessionData: SessionData = {
      id: employee.id,
      employeeID: employee.employeeID,
      email: employee.email,
      name: employee.name,
      nickname: employee.nickname || "",
      department: employee.department?.nameTh || "",
      position: employee.position?.nameTh || "",
      imageUrl: employee.imageUrl,
      mustChangePassword: employee.mustChangePassword,
      titlePrefix: employee.titlePrefix,
      ppPhone: employee.ppPhone,
      wPhone: employee.wPhone,
      birthday: employee.birthday ? employee.birthday.toISOString().slice(0, 10) : null,
      departmentId: employee.departmentId,
      positionId: employee.positionId,
      address: employee.address,
      dayOff: employee.dayOff,
      educationLevel: employee.educationLevel,
      university: employee.university,
      major: employee.major,
      bankName: employee.bankName,
      bankAccountNumber: employee.bankAccountNumber,
      socialSecurityStart: employee.socialSecurityStart ? employee.socialSecurityStart.toISOString().slice(0, 10) : null,
    };

    console.log("=== DEBUG: signIn ===");
    console.log("Employee data:", employee);
    console.log("Session data:", sessionData);
    console.log("Session token:", session.sessionToken);

    // Set session cookie with session token
    const cookieStore = await cookies();
    const maxAge = remember ? 30 * 24 * 60 * 60 : 60 * 60; // 30 days if remember me, 1 hour otherwise
    
    cookieStore.set("session_token", session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
    });

    // Return success state - redirect will be handled by client
    return { 
      success: true, 
      error: null,
      mustChangePassword: employee.mustChangePassword,
      redirectUrl: employee.mustChangePassword 
        ? "/main/change-password?force=true" 
        : `${from}?login=success&user=${encodeURIComponent(employee.nickname || employee.name)}`
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
  }
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const from = String(formData.get("from") || "/main");
  const remember = formData.get("remember") === "on";

  // Validate input
  if (!email || !password) {
    const error = encodeURIComponent("กรุณากรอกอีเมลและรหัสผ่าน");
    redirect(`/auth/login?error=${error}`);
  }

  // Find employee by email
  const employee = await prisma.employee.findUnique({
    where: { email },
    include: {
      department: true,
      position: true,
    },
  });

  if (!employee) {
    const error = encodeURIComponent("ไม่พบผู้ใช้นี้ในระบบ");
    redirect(`/auth/login?error=${error}`);
  }

  // Check if employee is active
  if (employee.status !== "active") {
    const error = encodeURIComponent("บัญชีผู้ใช้ถูกระงับการใช้งาน");
    redirect(`/auth/login?error=${error}`);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, employee.passwordHash);
  
  if (!isPasswordValid) {
    const error = encodeURIComponent("รหัสผ่านไม่ถูกต้อง");
    redirect(`/auth/login?error=${error}`);
  }

  // ตรวจสอบว่ารหัสผ่านเป็น 1234567890 หรือไม่
  const isDefaultPassword = await bcrypt.compare("1234567890", employee.passwordHash);
  if (isDefaultPassword) {
    // บังคับให้เปลี่ยนรหัสผ่านถ้าเป็นรหัสเริ่มต้น
    employee.mustChangePassword = true;
  }

  // Get headers for device fingerprint
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ipAddress = forwardedFor || realIp || "unknown";

  // Create new session with remember me option
  const session = await createSession(employee.id, remember);

  // Create session data
  const sessionData: SessionData = {
    id: employee.id,
    employeeID: employee.employeeID,
    email: employee.email,
    name: employee.name,
    nickname: employee.nickname || "",
    department: employee.department?.nameTh || "",
    position: employee.position?.nameTh || "",
    imageUrl: employee.imageUrl,
    mustChangePassword: employee.mustChangePassword,
    titlePrefix: employee.titlePrefix,
    ppPhone: employee.ppPhone,
    wPhone: employee.wPhone,
    birthday: employee.birthday ? employee.birthday.toISOString().slice(0, 10) : null,
    departmentId: employee.departmentId,
    positionId: employee.positionId,
    address: employee.address,
    dayOff: employee.dayOff,
    educationLevel: employee.educationLevel,
    university: employee.university,
    major: employee.major,
    bankName: employee.bankName,
    bankAccountNumber: employee.bankAccountNumber,
    socialSecurityStart: employee.socialSecurityStart ? employee.socialSecurityStart.toISOString().slice(0, 10) : null,
  };

  console.log("=== DEBUG: signIn ===");
  console.log("Employee data:", employee);
  console.log("Session data:", sessionData);
  console.log("Session token:", session.sessionToken);

  // Set session cookie with session token
  const cookieStore = await cookies();
  const maxAge = remember ? 30 * 24 * 60 * 60 : 60 * 60; // 30 days if remember me, 1 hour otherwise
  
  cookieStore.set("session_token", session.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAge,
  });

  // Redirect based on mustChangePassword flag
  if (employee.mustChangePassword) {
    redirect("/auth/change-password?force=true");
  }

  // Redirect to main dashboard with success flag
  redirect(`${from}?login=success&user=${encodeURIComponent(employee.nickname || employee.name)}`);
}

export async function signOut() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  
  if (sessionToken) {
    await deleteSession(sessionToken);
  }
  
  cookieStore.delete("session_token");
  redirect("/auth/login?logout=success");
}

export async function getCurrentUser(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    
    if (!sessionToken) {
      return null;
    }

    // Get headers for device fingerprint
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ipAddress = forwardedFor || realIp || "unknown";

    // Validate session
    const sessionData = await validateSession(sessionToken);
    
    if (!sessionData) {
      // Don't delete cookie here - let API routes handle it
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// ฟังก์ชันสำหรับตรวจสอบ session และ redirect ถ้าไม่ valid
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?error=" + encodeURIComponent("กรุณาเข้าสู่ระบบใหม่"));
  }
  return user;
}


