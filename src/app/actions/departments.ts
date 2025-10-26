"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createDepartment(formData: FormData) {
  try {
    const nameTh = formData.get("nameTh") as string;
    const nameEn = formData.get("nameEn") as string;
    const description = formData.get("description") as string;

    if (!nameTh && !nameEn) {
      return { ok: false, error: "กรุณากรอกชื่อแผนกอย่างน้อย 1 ภาษา" };
    }

    await prisma.department.create({
      data: {
        nameTh: nameTh || "",
        nameEn: nameEn || "",
        description: description || null,
      },
    });

    revalidatePath("/main/departments");
    return { ok: true, stamp: Date.now() };
  } catch (error) {
    console.error("Create department error:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการสร้างแผนก" };
  }
}

export async function updateDepartment(formData: FormData) {
  try {
    const id = parseInt(formData.get("id") as string);
    const nameTh = formData.get("nameTh") as string;
    const nameEn = formData.get("nameEn") as string;
    const description = formData.get("description") as string;

    if (!nameTh && !nameEn) {
      return { ok: false, error: "กรุณากรอกชื่อแผนกอย่างน้อย 1 ภาษา" };
    }

    await prisma.department.update({
      where: { id },
      data: {
        nameTh: nameTh || "",
        nameEn: nameEn || "",
        description: description || null,
      },
    });

    revalidatePath("/main/departments");
    return { ok: true, stamp: Date.now() };
  } catch (error) {
    console.error("Update department error:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการแก้ไขแผนก" };
  }
}

export async function deleteDepartment(formData: FormData) {
  try {
    const id = parseInt(formData.get("id") as string);

    // ตรวจสอบว่ามีพนักงานในแผนกนี้หรือไม่
    const employeeCount = await prisma.employee.count({
      where: { departmentId: id },
    });

    if (employeeCount > 0) {
      return { 
        ok: false, 
        error: `ไม่สามารถลบแผนกได้ เนื่องจากมีพนักงาน ${employeeCount} คนในแผนกนี้` 
      };
    }

    await prisma.department.delete({
      where: { id },
    });

    revalidatePath("/main/departments");
    return { ok: true, stamp: Date.now() };
  } catch (error) {
    console.error("Delete department error:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการลบแผนก" };
  }
}

export async function getDepartments() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { nameTh: "asc" },
    });
    return departments;
  } catch (error) {
    console.error("Get departments error:", error);
    return [];
  }
}
