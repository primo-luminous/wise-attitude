// app/actions/profile.ts
"use server";
import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";

type ProfileFormState = { ok: boolean; error?: string; stamp: number };

function strOrNull(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function normalizePhone(v: FormDataEntryValue | null) {
  const d = String(v ?? "").replace(/\D/g, "").slice(0, 10);
  if (!d) return null;
  const a = d.slice(0, 3), b = d.slice(3, 6), c = d.slice(6);
  return d.length <= 3 ? a : d.length <= 6 ? `${a}-${b}` : `${a}-${b}-${c}`;
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png":  ".png",
  "image/webp": ".webp",
  "image/gif":  ".gif",
};

/* =========================
 *  อ่านโปรไฟล์ของตัวเอง
 * ========================= */
export async function getMyProfile() {
  const store = await cookies();
  const sessionToken = store.get("session_token")?.value;
  
  if (!sessionToken) {
    return { ok: false, error: "Unauthenticated" };
  }

  // ใช้ getCurrentUser จาก auth actions
  const { getCurrentUser } = await import("@/app/actions/auth");
  const user = await getCurrentUser();
  
  if (!user) {
    return { ok: false, error: "Invalid session" };
  }

  const userId = user.id;
  if (!userId) return { ok: false, error: "Invalid user" };

  const me = await prisma.employee.findUnique({
    where: { id: userId },
    select: {
      id: true,
      employeeID: true,
      titlePrefix: true,
      name: true,
      nickname: true,
      citizenID: true,
      email: true,
      mustChangePassword: true,
      imageUrl: true,
      ppPhone: true,
      wPhone: true,
      birthday: true,
      status: true,
      departmentId: true,
      positionId: true,
      address: true,
      dayOff: true,
      educationLevel: true,
      major: true,
      bankName: true,
      bankAccountNumber: true,
      socialSecurityStart: true,
      university: true,
      createdAt: true,
      updatedAt: true,
      department: { select: { id: true, nameTh: true, nameEn: true } },
      position:   { select: { id: true, nameTh: true, nameEn: true } },
    },
  });

  if (!me) return { ok: false, error: "User not found" };

  return {
    ok: true,
    profile: {
      id: me.id,
      employeeID: me.employeeID,
      titlePrefix: me.titlePrefix,
      name: me.name,
      nickname: me.nickname,
      citizenID: me.citizenID,
      email: me.email,
      mustChangePassword: me.mustChangePassword,
      imageUrl: me.imageUrl,
      ppPhone: me.ppPhone,
      wPhone: me.wPhone,
      birthday: me.birthday ? me.birthday.toISOString().slice(0, 10) : null,
      status: me.status,
      departmentId: me.departmentId,
      positionId: me.positionId,
      address: me.address,
      dayOff: me.dayOff,
      educationLevel: me.educationLevel,
      major: me.major,
      bankName: me.bankName,
      bankAccountNumber: me.bankAccountNumber,
      socialSecurityStart: me.socialSecurityStart ? me.socialSecurityStart.toISOString().slice(0, 10) : null,
      university: me.university,
      createdAt: me.createdAt.toISOString().slice(0, 10),
      updatedAt: me.updatedAt.toISOString().slice(0, 10),
      department: me.department?.nameTh ?? me.department?.nameEn ?? "",
      position: me.position?.nameTh ?? me.position?.nameEn ?? "",
      // Legacy fields for backward compatibility
      phone: me.ppPhone ?? me.wPhone ?? "",
      avatar: me.imageUrl ?? "",
      startDate: me.socialSecurityStart?.toISOString().slice(0, 10) ?? me.createdAt.toISOString().slice(0, 10),
    },
  };
}

/* =========================================
 *  ใช้จาก client: บันทึกโปรไฟล์ (wrapper)
 * ========================================= */
export async function saveMyProfile(prevState: ProfileFormState, formData: FormData) {
  return updateMyProfile(prevState, formData);
}

/* =========================
 *  อัปเดตโปรไฟล์ของตัวเอง
 * ========================= */
export async function updateMyProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const stamp = Date.now();

  const store = await cookies();
  const sessionToken = store.get("session_token")?.value;
  
  if (!sessionToken) {
    return { ok: false, error: "Unauthenticated", stamp };
  }

  // ใช้ getCurrentUser จาก auth actions
  const { getCurrentUser } = await import("@/app/actions/auth");
  const user = await getCurrentUser();
  
  if (!user) {
    return { ok: false, error: "Invalid session", stamp };
  }

  const userId = user.id;
  if (!userId) return { ok: false, error: "Invalid user", stamp };

  // อ่านข้อมูลเดิมที่ต้องใช้ตรวจสิทธิ์/ไฟล์เก่า
  const me = await prisma.employee.findUnique({
    where: { id: userId },
    select: { departmentId: true, positionId: true, imageUrl: true },
  });
  if (!me) return { ok: false, error: "User not found", stamp };

  const canEditAll = me.departmentId === 1 && me.positionId === 1;

  // ฟิลด์ทั่วไป
  const name        = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required", stamp };

  const nickname    = strOrNull(formData.get("nickname"));
  const titlePrefix = strOrNull(formData.get("titlePrefix"));
  const ppPhone     = normalizePhone(formData.get("ppPhone"));
  const wPhone      = normalizePhone(formData.get("wPhone"));

  const birthdayStr = String(formData.get("birthday") ?? "").trim();
  const birthday    = birthdayStr ? new Date(birthdayStr) : null;

  // ฟิลด์เสริม
  const address            = strOrNull(formData.get("address"));
  const dayOff             = strOrNull(formData.get("dayOff"));
  const educationLevel     = strOrNull(formData.get("educationLevel"));
  const university         = strOrNull(formData.get("university"));
  const major              = strOrNull(formData.get("major"));
  const bankName           = strOrNull(formData.get("bankName"));
  const bankAccountNumber  = strOrNull(formData.get("bankAccountNumber"));
  const ssStartStr         = String(formData.get("socialSecurityStart") ?? "").trim();
  const socialSecurityStart = ssStartStr ? new Date(ssStartStr) : null;

  const data: Record<string, unknown> = {
    name, nickname, titlePrefix, ppPhone, wPhone, birthday,
    address, dayOff, educationLevel, university, major,
    bankName, bankAccountNumber, socialSecurityStart,
  };

  // Email/Department/Position ให้ admin เท่านั้น
  if (canEditAll) {
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return { ok: false, error: "Email is required", stamp };
    data.email = email;

    const depRaw = formData.get("departmentId");
    const posRaw = formData.get("positionId");

    const newDepId = depRaw ? Number(depRaw) : me.departmentId ?? null;
    const newPosId = posRaw ? Number(posRaw) : me.positionId ?? null;

    // ตรวจความสัมพันธ์ตำแหน่งกับแผนก
    if (newPosId != null && newDepId != null) {
      const valid = await prisma.position.count({
        where: { id: newPosId, departmentId: newDepId },
      });
      if (!valid) {
        return { ok: false, error: "ตำแหน่งที่เลือกไม่ได้อยู่ในแผนกนี้", stamp };
      }
    }

    if (depRaw) data.departmentId = newDepId;
    if (posRaw) data.positionId   = newPosId;
  }

  // อัปโหลด avatar (ถ้ามี)
  const avatar = formData.get("avatar") as File | null;
  if (avatar && avatar.size > 0) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(avatar.type)) {
      return { ok: false, error: "Unsupported image type", stamp };
    }
    if (avatar.size > 2_000_000) {
      return { ok: false, error: "Image too large (max 2MB)", stamp };
    }

    const arrayBuf = await avatar.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const ext = (EXT_BY_MIME[avatar.type] ?? path.extname(avatar.name)) || ".jpg";
    const dir = path.join(process.cwd(), "public", "assets", "images", "upload", "users");
    await fs.mkdir(dir, { recursive: true });

    const filename = `${userId}-${Date.now()}${ext}`;
    const filepath = path.join(dir, filename);
    await fs.writeFile(filepath, buffer);

    data.imageUrl = `/assets/images/upload/users/${filename}`;

    // ลบไฟล์เก่า (ถ้ามี)
    if (me.imageUrl && me.imageUrl !== data.imageUrl) {
      try {
        const oldPath = path.join(process.cwd(), "public", me.imageUrl.replace(/^\//, ""));
        await fs.unlink(oldPath);
      } catch {
        // ignore error
      }
    }
  }

  // บันทึก
  try {
    await prisma.employee.update({ where: { id: userId }, data });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string; meta?: { target?: string | string[] } }).code === "P2002") {
      const target = Array.isArray((e as { meta?: { target?: string | string[] } }).meta?.target) ? ((e as { meta?: { target?: string | string[] } }).meta!.target as string[]).join(",") : "";
      const msg =
        target?.includes("em_citizenID") ? "Citizen ID already exists" :
        target?.includes("em_email")     ? "Email already in use" :
        "Duplicated unique field";
      return { ok: false, error: msg, stamp };
    }
    return { ok: false, error: "Unexpected error", stamp };
  }

  revalidatePath("/main/profile");
  return { ok: true, stamp };
}

/* ===================
 *  เปลี่ยนรหัสผ่าน
 * =================== */
export async function changePassword(formData: FormData) {
  const currentPassword  = String(formData.get("currentPassword") || "").trim();
  const newPassword      = String(formData.get("newPassword") || "").trim();
  const confirmPassword  = String(formData.get("confirmPassword") || "").trim();

  try {
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
    if (newPassword.length < 8) {
      throw new Error("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
    }

    // ใช้ getCurrentUser จาก auth actions
    const { getCurrentUser } = await import("@/app/actions/auth");
    const user = await getCurrentUser();
    
    if (!user) {
      redirect("/auth/login");
    }

    const userId = user.id;
    if (!userId) throw new Error("Invalid user");

    const employee = await prisma.employee.findUnique({ where: { id: userId } });
    if (!employee) throw new Error("ไม่พบผู้ใช้ในระบบ");

    // Debug log
    console.log("=== DEBUG: changePassword ===");
    console.log("Employee ID:", userId);
    console.log("mustChangePassword:", employee.mustChangePassword);
    console.log("newPassword:", newPassword);

    // ตรวจสอบรหัสผ่านปัจจุบัน (ยกเว้นกรณีที่ต้องเปลี่ยนรหัสผ่าน)
    if (!employee.mustChangePassword) {
      const isCurrentValid = await bcrypt.compare(currentPassword, employee.passwordHash);
      if (!isCurrentValid) throw new Error("รหัสผ่านปัจจุบันไม่ถูกต้อง");
    }

    // ตรวจสอบว่ารหัสผ่านใหม่ไม่ใช่ 1234567890 (เฉพาะกรณีปกติเท่านั้น)
    if (newPassword === "1234567890" && !employee.mustChangePassword) {
      throw new Error("รหัสผ่านใหม่ไม่สามารถเป็นรหัสเริ่มต้นได้");
    }
    
    // ถ้าต้องเปลี่ยนรหัสผ่าน (mustChangePassword = true) ให้อนุญาตให้เปลี่ยนเป็น 1234567890 ได้
    // ไม่ต้องทำอะไรเพิ่มเติม เพราะจะผ่านการตรวจสอบด้านบน

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.employee.update({
      where: { id: userId },
      data: { passwordHash: newHash, mustChangePassword: false, updatedAt: new Date() },
    });

    // ลบ session ทั้งหมดของ user นี้
    await prisma.userSession.updateMany({
      where: { 
        employeeId: userId,
        isActive: true 
      },
      data: { isActive: false }
    });

    // ลบ session cookie และ cache ทั้งหมด
    const cookieStore = await cookies();
    cookieStore.delete("session_token");
    
    // ลบ cache ทั้งหมด
    revalidatePath("/", "layout");
    revalidatePath("/main", "layout");
    revalidatePath("/main/change-password");
    revalidatePath("/main/profile");
    
    // Return success state - redirect จะทำใน client-side
    return { ok: true, redirect: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { ok: false, error: (error as Error)?.message ?? "เกิดข้อผิดพลาด" };
  }
}
