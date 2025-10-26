"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function createAssetCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const note = formData.get("note") as string;

    // Validation
    if (!name || name.trim().length === 0) {
      return { ok: false, error: "ชื่อหมวดหมู่ไม่สามารถว่างได้" };
    }

    // Check if name already exists
    const existingCategory = await prisma.assetCategory.findFirst({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      return { ok: false, error: "ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว" };
    }

    // Create category
    await prisma.assetCategory.create({
      data: {
        name: name.trim(),
        note: note?.trim() || null,
      },
    });

    revalidatePath("/main/assetscategory");
    return { ok: true };
  } catch (error) {
    console.error("Error creating asset category:", error);
    
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    
    return { ok: false, error: "เกิดข้อผิดพลาดในการสร้างหมวดหมู่" };
  }
}

export async function updateAssetCategory(formData: FormData) {
  try {
    const id = parseInt(formData.get("id") as string);
    const name = formData.get("name") as string;
    const note = formData.get("note") as string;

    // Validation
    if (!id || isNaN(id)) {
      return { ok: false, error: "ID ไม่ถูกต้อง" };
    }

    if (!name || name.trim().length === 0) {
      return { ok: false, error: "ชื่อหมวดหมู่ไม่สามารถว่างได้" };
    }

    // Check if category exists
    const existingCategory = await prisma.assetCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return { ok: false, error: "ไม่พบหมวดหมู่นี้" };
    }

    // Check if new name conflicts with other categories
    const nameConflict = await prisma.assetCategory.findFirst({
      where: { 
        name: name.trim(),
        id: { not: id } // Exclude current category
      },
    });

    if (nameConflict) {
      return { ok: false, error: "ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว" };
    }

    // Update category
    await prisma.assetCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        note: note?.trim() || null,
      },
    });

    revalidatePath("/main/assetscategory");
    return { ok: true };
  } catch (error) {
    console.error("Error updating asset category:", error);
    
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    
    return { ok: false, error: "เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่" };
  }
}

export async function deleteAssetCategory(id: number) {
  try {
    // Check if category exists
    const existingCategory = await prisma.assetCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return { ok: false, error: "ไม่พบหมวดหมู่นี้" };
    }

    // Check if category has associated assets
    const associatedAssets = await prisma.asset.findFirst({
      where: { categoryId: id },
    });

    if (associatedAssets) {
      return { ok: false, error: "ไม่สามารถลบหมวดหมู่ที่มีทรัพย์สินอยู่ได้" };
    }

    // Delete category
    await prisma.assetCategory.delete({
      where: { id },
    });

    revalidatePath("/main/assetscategory");
    return { ok: true };
  } catch (error) {
    console.error("Error deleting asset category:", error);
    
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    
    return { ok: false, error: "เกิดข้อผิดพลาดในการลบหมวดหมู่" };
  }
}
