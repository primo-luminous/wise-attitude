"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createPosition(formData: FormData) {
  try {
    const nameTh = formData.get("nameTh") as string;
    const nameEn = formData.get("nameEn") as string;
    const description = formData.get("description") as string;
    const level = parseInt(formData.get("level") as string);
    const departmentId = parseInt(formData.get("departmentId") as string);

    if (!nameTh && !nameEn) {
      return { ok: false, error: "กรุณากรอกชื่อตำแหน่งอย่างน้อย 1 ภาษา" };
    }

    if (!departmentId) {
      return { ok: false, error: "กรุณาเลือกแผนก" };
    }

    // ตรวจสอบว่ามีตำแหน่งชื่อเดียวกันในแผนกนี้หรือไม่
    const existingPosition = await prisma.position.findFirst({
      where: {
        OR: [
          { nameTh: nameTh || undefined },
          { nameEn: nameEn || undefined }
        ],
        departmentId: departmentId
      }
    });

    if (existingPosition) {
      return { ok: false, error: "ตำแหน่งนี้มีอยู่ในแผนกแล้ว" };
    }

    await prisma.position.create({
      data: {
        nameTh: nameTh || "",
        nameEn: nameEn || "",
        description: description || null,
        level: level || 1,
        departmentId: departmentId,
      },
    });

    revalidatePath("/main/positions");
    return { ok: true, stamp: Date.now() };
  } catch (error) {
    console.error("Create position error:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการสร้างตำแหน่ง" };
  }
}

export async function updatePosition(formData: FormData) {
  try {
    const id = parseInt(formData.get("id") as string);
    const nameTh = formData.get("nameTh") as string;
    const nameEn = formData.get("nameEn") as string;
    const description = formData.get("description") as string;
    const level = parseInt(formData.get("level") as string);
    const departmentId = parseInt(formData.get("departmentId") as string);

    if (!nameTh && !nameEn) {
      return { ok: false, error: "กรุณากรอกชื่อตำแหน่งอย่างน้อย 1 ภาษา" };
    }

    if (!departmentId) {
      return { ok: false, error: "กรุณาเลือกแผนก" };
    }

    // ตรวจสอบว่ามีตำแหน่งชื่อเดียวกันในแผนกนี้หรือไม่ (ยกเว้นตำแหน่งปัจจุบัน)
    const existingPosition = await prisma.position.findFirst({
      where: {
        OR: [
          { nameTh: nameTh || undefined },
          { nameEn: nameEn || undefined }
        ],
        departmentId: departmentId,
        NOT: { id: id }
      }
    });

    if (existingPosition) {
      return { ok: false, error: "ตำแหน่งนี้มีอยู่ในแผนกแล้ว" };
    }

    await prisma.position.update({
      where: { id },
      data: {
        nameTh: nameTh || "",
        nameEn: nameEn || "",
        description: description || null,
        level: level || 1,
        departmentId: departmentId,
      },
    });

    revalidatePath("/main/positions");
    return { ok: true, stamp: Date.now() };
  } catch (error) {
    console.error("Update position error:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการแก้ไขตำแหน่ง" };
  }
}

export async function deletePosition(formData: FormData) {
  try {
    const id = parseInt(formData.get("id") as string);

    // ตรวจสอบว่ามีพนักงานในตำแหน่งนี้หรือไม่
    const employeeCount = await prisma.employee.count({
      where: { positionId: id },
    });

    if (employeeCount > 0) {
      return { 
        ok: false, 
        error: `ไม่สามารถลบตำแหน่งได้ เนื่องจากมีพนักงาน ${employeeCount} คนในตำแหน่งนี้` 
      };
    }

    await prisma.position.delete({
      where: { id },
    });

    revalidatePath("/main/positions");
    return { ok: true, stamp: Date.now() };
  } catch (error) {
    console.error("Delete position error:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการลบตำแหน่ง" };
  }
}

export async function getPositions() {
  try {
    const positions = await prisma.position.findMany({
      include: {
        department: true,
      },
      orderBy: { nameTh: "asc" },
    });

    return positions.map((pos: { id: number; nameTh: string; nameEn: string; description: string | null; level: number; departmentId: number | null; createdAt: Date; updatedAt: Date; department: { nameTh: string; nameEn: string } | null }) => ({
      id: pos.id,
      nameTh: pos.nameTh,
      nameEn: pos.nameEn,
      description: pos.description,
      level: pos.level,
      departmentId: pos.departmentId,
      departmentLabel: pos.department?.nameTh || pos.department?.nameEn || "ไม่ระบุ",
      createdAt: pos.createdAt.toISOString(),
      updatedAt: pos.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Get positions error:", error);
    return [];
  }
}

export async function getDepartments() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { nameTh: "asc" },
    });
    
    return departments.map((dept: { id: number; nameTh: string; nameEn: string }) => ({
      id: dept.id,
      label: dept.nameTh || dept.nameEn || "ไม่ระบุ",
    }));
  } catch (error) {
    console.error("Get departments error:", error);
    return [];
  }
}
