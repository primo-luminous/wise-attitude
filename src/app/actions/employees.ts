"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/* ---------- utils ---------- */
const toIntOrNull = (v: FormDataEntryValue | null) => {
  const s = (v as string) ?? "";
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const toDateOrNull = (v: FormDataEntryValue | null) => {
  const s = (v as string) ?? "";
  return s ? new Date(s) : null;
};

export async function createEmployee(formData: FormData) {
  try {
    const employeeID = (formData.get("employeeID") as string) ?? "";
    const titlePrefix = (formData.get("titlePrefix") as string) ?? "";
    const name = (formData.get("name") as string) ?? "";
    const nickname = (formData.get("nickname") as string) ?? "";
    const email = (formData.get("email") as string) ?? "";
    const ppPhone = (formData.get("ppPhone") as string) ?? "";
    const wPhone = (formData.get("wPhone") as string) ?? "";
    const birthday = toDateOrNull(formData.get("birthday"));
    const status = (formData.get("status") as "active" | "inactive" | "suspended") ?? "active";
    const departmentId = toIntOrNull(formData.get("departmentId"));
    const positionId = toIntOrNull(formData.get("positionId"));

    // extra fields
    const address = (formData.get("address") as string) || null;
    const dayOff = (formData.get("dayOff") as string) || null;
    const educationLevel = (formData.get("educationLevel") as string) || null;
    const university = (formData.get("university") as string) || null;
    const major = (formData.get("major") as string) || null;
    const bankName = (formData.get("bankName") as string) || null;
    const bankAccountNumber = (formData.get("bankAccountNumber") as string) || null;
    const socialSecurityStart = toDateOrNull(formData.get("socialSecurityStart"));

    // Handle image upload
    let imageUrl = null;
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);
        
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/upload`, {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        // Continue without image if upload fails
      }
    }

    if (!employeeID || !name || !email || !departmentId) {
      return { ok: false, error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" };
    }

    // duplicate checks
    const existingEmployee = await prisma.employee.findUnique({ where: { employeeID } });
    if (existingEmployee) return { ok: false, error: "Employee ID นี้มีอยู่ในระบบแล้ว" };

    const existingEmail = await prisma.employee.findUnique({ where: { email } });
    if (existingEmail) return { ok: false, error: "Email นี้มีอยู่ในระบบแล้ว" };

    // validate position belongs to department (ถ้ามี positionId)
    if (positionId) {
      const pos = await prisma.position.findUnique({ where: { id: positionId }, select: { departmentId: true } });
      if (!pos) return { ok: false, error: "ไม่พบตำแหน่งที่เลือก" };
      if (pos.departmentId && pos.departmentId !== departmentId) {
        return { ok: false, error: "ตำแหน่งที่เลือกไม่อยู่ในแผนกที่เลือก" };
      }
    }

    await prisma.employee.create({
      data: {
        employeeID,
        titlePrefix: titlePrefix || null,
        name,
        nickname: nickname || null,
        email,
        ppPhone: ppPhone || null,
        wPhone: wPhone || null,
        birthday,
        status,
        departmentId: departmentId!,
        positionId: positionId ?? null,
        passwordHash: await bcrypt.hash("1234567890", 10), // Default password with bcrypt
        imageUrl,

        // extra
        address,
        dayOff,
        educationLevel,
        university,
        major,
        bankName,
        bankAccountNumber,
        socialSecurityStart,
      },
    });

    revalidatePath("/main/employees");
    return { ok: true, stamp: Date.now() };
  } catch (error) {
    console.error("Create employee error:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการสร้างพนักงาน" };
  }
}

export async function updateEmployee(formData: FormData) {
  try {
    const id = toIntOrNull(formData.get("id"));
    if (!id) return { ok: false, error: "ไม่พบข้อมูลพนักงาน" };

    const employeeID = (formData.get("employeeID") as string) ?? "";
    const titlePrefix = (formData.get("titlePrefix") as string) ?? "";
    const name = (formData.get("name") as string) ?? "";
    const nickname = (formData.get("nickname") as string) ?? "";
    const email = (formData.get("email") as string) ?? "";
    const ppPhone = (formData.get("ppPhone") as string) ?? "";
    const wPhone = (formData.get("wPhone") as string) ?? "";
    const birthday = toDateOrNull(formData.get("birthday"));
    const status = (formData.get("status") as "active" | "inactive" | "suspended") ?? "active";
    const departmentId = toIntOrNull(formData.get("departmentId"));
    const positionId = toIntOrNull(formData.get("positionId"));

    // extra fields
    const address = (formData.get("address") as string) || null;
    const dayOff = (formData.get("dayOff") as string) || null;
    const educationLevel = (formData.get("educationLevel") as string) || null;
    const university = (formData.get("university") as string) || null;
    const major = (formData.get("major") as string) || null;
    const bankName = (formData.get("bankName") as string) || null;
    const bankAccountNumber = (formData.get("bankAccountNumber") as string) || null;
    const socialSecurityStart = toDateOrNull(formData.get("socialSecurityStart"));

    // Handle image upload
    let imageUrl = null;
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);
        
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/upload`, {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        // Continue without image if upload fails
      }
    }

    if (!employeeID || !name || !email || !departmentId) {
      return { ok: false, error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" };
    }

    // duplicate checks (exclude self)
    const existingEmployee = await prisma.employee.findFirst({
      where: { employeeID, id: { not: id } },
    });
    if (existingEmployee) return { ok: false, error: "Employee ID นี้มีอยู่ในระบบแล้ว" };

    const existingEmail = await prisma.employee.findFirst({
      where: { email, id: { not: id } },
    });
    if (existingEmail) return { ok: false, error: "Email นี้มีอยู่ในระบบแล้ว" };

    // validate position belongs to department (ถ้ามี positionId)
    if (positionId) {
      const pos = await prisma.position.findUnique({ where: { id: positionId }, select: { departmentId: true } });
      if (!pos) return { ok: false, error: "ไม่พบตำแหน่งที่เลือก" };
      if (pos.departmentId && pos.departmentId !== departmentId) {
        return { ok: false, error: "ตำแหน่งที่เลือกไม่อยู่ในแผนกที่เลือก" };
      }
    }

    // Get current employee data to preserve existing imageUrl if no new image is uploaded
    const currentEmployee = await prisma.employee.findUnique({
      where: { id },
      select: { imageUrl: true }
    });

    await prisma.employee.update({
      where: { id },
      data: {
        employeeID,
        titlePrefix: titlePrefix || null,
        name,
        nickname: nickname || null,
        email,
        ppPhone: ppPhone || null,
        wPhone: wPhone || null,
        birthday,
        status,
        departmentId: departmentId!,
        positionId: positionId ?? null,
        passwordHash: await bcrypt.hash("1234567890", 10), // Default password with bcrypt
        imageUrl: imageUrl || currentEmployee?.imageUrl || null,

        // extra
        address,
        dayOff,
        educationLevel,
        university,
        major,
        bankName,
        bankAccountNumber,
        socialSecurityStart,
      },
    });

    revalidatePath("/main/employees");
    return { ok: true, stamp: Date.now() };
  } catch (error) {
    console.error("Update employee error:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการแก้ไขพนักงาน" };
  }
}

export async function deleteEmployee(formData: FormData) {
  try {
    const id = toIntOrNull(formData.get("id"));
    if (!id) return { ok: false, error: "ไม่พบข้อมูลพนักงาน" };

    await prisma.employee.delete({ where: { id } });

    revalidatePath("/main/employees");
    return { ok: true, stamp: Date.now() };
  } catch (error) {
    console.error("Delete employee error:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการลบพนักงาน" };
  }
}

export async function resetEmployeePassword(formData: FormData) {
  try {
    const id = toIntOrNull(formData.get("id"));
    if (!id) return { ok: false, error: "ไม่พบข้อมูลพนักงาน" };

    // ตรวจสอบว่าพนักงานมีอยู่จริง
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { id: true, name: true, employeeID: true }
    });

    if (!employee) {
      return { ok: false, error: "ไม่พบข้อมูลพนักงาน" };
    }

    // ตั้งรหัสผ่านเป็น 1234567890
    const newPassword = "1234567890";
    
    // เข้ารหัสรหัสผ่านด้วย bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await prisma.employee.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
        mustChangePassword: true, // บังคับให้เปลี่ยนรหัสผ่านครั้งแรก
      },
    });

    revalidatePath("/main/employees");
    return { 
      ok: true, 
      stamp: Date.now(),
      message: `รหัสผ่านของพนักงาน ${employee.name} (${employee.employeeID}) ถูกรีเซ็ตเป็นรหัสเริ่มต้นแล้ว`,
      newPassword: newPassword
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" };
  }
}

export async function getEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: { select: { id: true, nameEn: true } },
        position: { select: { id: true, nameEn: true, departmentId: true } },
      },
      orderBy: { employeeID: "asc" },
    });

    return employees.map((emp: { id: number; employeeID: string; titlePrefix: string | null; name: string; nickname: string | null; email: string; ppPhone: string | null; wPhone: string | null; birthday: Date | null; status: string; departmentId: number | null; positionId: number | null; address: string | null; dayOff: string | null; educationLevel: string | null; major: string | null; bankName: string | null; bankAccountNumber: string | null; socialSecurityStart: Date | null; university: string | null; createdAt: Date; updatedAt: Date; department: { nameEn: string } | null; position: { nameEn: string; departmentId: number | null } | null }) => ({
      id: emp.id,
      employeeID: emp.employeeID,
      titlePrefix: emp.titlePrefix,
      name: emp.name,
      nickname: emp.nickname,
      email: emp.email,
      ppPhone: emp.ppPhone,
      wPhone: emp.wPhone,
      birthday: emp.birthday,
      status: emp.status,
      departmentId: emp.departmentId,
      positionId: emp.positionId,

      // ✅ ส่งเฉพาะอังกฤษ
      departmentLabel: emp.department?.nameEn?.trim() || "",
      positionLabel: emp.position?.nameEn?.trim() || "",

      updatedAt: emp.updatedAt.toISOString(),
      createdAt: emp.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Get employees error:", error);
    return [];
  }
}

export async function getDepartments() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, nameTh: true, description: true },
    });
    // ให้ front ใช้ label เป็นอังกฤษ
    return departments.map((d: { id: number; nameEn: string; nameTh: string; description: string | null }) => ({ ...d, label: d.nameEn }));
  } catch (error) {
    console.error("Get departments error:", error);
    return [];
  }
}

export async function getPositions() {
  try {
    const positions = await prisma.position.findMany({
      include: { department: { select: { id: true, nameEn: true } } },
      orderBy: { nameEn: "asc" },
    });

    return positions.map((pos: { id: number; nameTh: string; nameEn: string; description: string | null; level: number; departmentId: number | null; createdAt: Date; updatedAt: Date; department: { id: number; nameEn: string } | null }) => ({
      id: pos.id,
      nameTh: pos.nameTh,
      nameEn: pos.nameEn,
      description: pos.description,
      level: pos.level,
      departmentId: pos.departmentId,
      // ✅ label ภาษาอังกฤษ
      departmentLabel: pos.department?.nameEn || "Not set",
      createdAt: pos.createdAt.toISOString(),
      updatedAt: pos.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Get positions error:", error);
    return [];
  }
}
