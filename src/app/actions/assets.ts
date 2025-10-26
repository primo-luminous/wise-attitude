"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { convertDecimal } from "@/lib/utils";
import { Decimal } from "@prisma/client/runtime/library";


// Helper function to get current user from session
async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    throw new Error("ไม่พบ session");
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);
    return sessionData.user;
  } catch {
    throw new Error("Session ไม่ถูกต้อง");
  }
}

// Helper function to handle image upload
async function handleImageUpload(imageFile: File): Promise<string | null> {
  if (!imageFile || imageFile.size === 0) return null;

  try {
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "assets", "images", "upload", "image-assets");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = imageFile.name.split('.').pop();
    const filename = `asset-${timestamp}-${randomString}.${fileExtension}`;

    // Save file
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL - use the correct path that matches the public directory
    const publicUrl = `/assets/images/upload/image-assets/${filename}`;
    console.log("Image uploaded successfully:", {
      filename,
      filePath,
      publicUrl,
      uploadDir
    });

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

// Create Asset
export async function createAsset(formData: FormData) {
  try {

    const sku = formData.get("sku") as string;
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const description = formData.get("description") as string;
    const isSerialized = formData.get("isSerialized") === "on";
    const totalQty = parseInt(formData.get("totalQty") as string) || 0;
    const purchaseDate = formData.get("purchaseDate") as string;
    const purchasePrice = formData.get("purchasePrice") as string;
    const warrantyMode = formData.get("warrantyMode") as string;
    const warrantyMonths = formData.get("warrantyMonths") as string;
    const warrantyUntil = formData.get("warrantyUntil") as string;
    const snBulk = formData.get("snBulk") as string;

    // Debug: Log all form data
    console.log("Form Data received:", {
      sku,
      name,
      categoryId,
      description,
      isSerialized,
      totalQty,
      purchaseDate,
      purchasePrice,
      warrantyMode,
      warrantyMonths,
      warrantyUntil,
      snBulk
    });

    // Validate required fields
    if (!sku || !name) {
      console.log("Validation failed: SKU or name is missing", { sku, name });
      return { ok: false, error: "SKU และชื่อเป็นข้อมูลที่จำเป็น" };
    }

    // Check if SKU already exists
    const existingAsset = await prisma.asset.findUnique({
      where: { sku },
    });

    if (existingAsset) {
      return { ok: false, error: "SKU นี้มีอยู่ในระบบแล้ว" };
    }

    // Prepare warranty data
    let warrantyMonthsNum = null;
    let warrantyUntilDate = null;

    if (warrantyMode === "months" && warrantyMonths) {
      warrantyMonthsNum = parseInt(warrantyMonths);
    } else if (warrantyMode === "until" && warrantyUntil) {
      warrantyUntilDate = new Date(warrantyUntil);
    }

    // Handle image upload
    const imageFile = formData.get("image") as File;
    const imageUrl = await handleImageUpload(imageFile);

    // Debug: Log the image upload result
    console.log("Image upload result:", {
      imageFile: imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : "No file",
      imageUrl: imageUrl,
      uploadDir: join(process.cwd(), "public", "assets", "images", "upload", "image-assets")
    });

    // Create asset
    const asset = await prisma.asset.create({
      data: {
        sku,
        name,
        categoryId: categoryId ? parseInt(categoryId) : null,
        description: description || null,
        isSerialized,
        totalQty: isSerialized ? 0 : totalQty,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        warrantyMonths: warrantyMonthsNum,
        warrantyUntil: warrantyUntilDate,
        imageUrl,
        status: "ACTIVE",
      },
    });

    // If serialized and SN bulk provided, create units
    if (isSerialized && snBulk) {
      const serialNumbers = snBulk
        .split("\n")
        .map((sn: string) => sn.trim())
        .filter(sn => sn.length > 0);

      if (serialNumbers.length > 0) {
        await prisma.assetUnit.createMany({
          data: serialNumbers.map((sn: string) => ({
            assetId: asset.id,
            serialNumber: sn,
            status: "ACTIVE",
          })),
        });
      }
    }

    // สร้าง notification สำหรับการเพิ่มทรัพย์สินใหม่
    try {
      const currentUser = await getCurrentUser();
      
      // สร้าง notification โดยตรง
      const employees = await prisma.employee.findMany({
        select: { id: true },
        where: { status: 'active' }
      });

      const notifications = employees.map((emp: { id: number }) => ({
        employeeId: emp.id,
        type: 'ASSET_ADDED' as const,
        title: 'มีการเพิ่มทรัพย์สินใหม่',
        message: `${currentUser.name} ได้เพิ่มทรัพย์สิน ${asset.name} เข้าระบบ`,
        data: { assetId: asset.id, assetName: asset.name, actionBy: currentUser.name }
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
      

    } catch (error) {
      console.error("Error creating asset notification:", error);
      // ไม่ throw error เพื่อไม่ให้กระทบการสร้าง asset
    }

    revalidatePath("/main/assets");
    return { ok: true, asset };
  } catch (error) {
    console.error("Error creating asset:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการสร้างทรัพย์สิน" };
  }
}

// Update Asset
export async function updateAsset(formData: FormData) {
  try {

    const id = parseInt(formData.get("id") as string);
    const sku = formData.get("sku") as string;
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const description = formData.get("description") as string;
    const isSerialized = formData.get("isSerialized") === "on";
    const totalQty = parseInt(formData.get("totalQty") as string) || 0;
    const purchaseDate = formData.get("purchaseDate") as string;
    const purchasePrice = formData.get("purchasePrice") as string;
    const warrantyMode = formData.get("warrantyMode") as string;
    const warrantyMonths = formData.get("warrantyMonths") as string;
    const warrantyUntil = formData.get("warrantyUntil") as string;
    const removeImage = formData.get("removeImage") === "1";

    // Debug: Log all form data
    console.log("Update Asset Form Data received:", {
      id,
      sku,
      name,
      categoryId,
      description,
      isSerialized,
      totalQty,
      purchaseDate,
      purchasePrice,
      warrantyMode,
      warrantyMonths,
      warrantyUntil,
      removeImage
    });

    // Validate required fields
    if (!id || !sku || !name) {
      console.log("Update validation failed: missing required fields", { id, sku, name });
      return { ok: false, error: "ข้อมูลไม่ครบถ้วน" };
    }

    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existingAsset) {
      return { ok: false, error: "ไม่พบทรัพย์สิน" };
    }

    // Check if SKU already exists (excluding current asset)
    const duplicateSku = await prisma.asset.findFirst({
      where: {
        sku,
        id: { not: id },
      },
    });

    if (duplicateSku) {
      return { ok: false, error: "SKU นี้มีอยู่ในระบบแล้ว" };
    }

    // Prepare warranty data
    let warrantyMonthsNum = null;
    let warrantyUntilDate = null;

    try {
      if (warrantyMode === "months" && warrantyMonths) {
        warrantyMonthsNum = parseInt(warrantyMonths);
        if (isNaN(warrantyMonthsNum)) {
          return { ok: false, error: "จำนวนเดือนประกันไม่ถูกต้อง" };
        }
      } else if (warrantyMode === "until" && warrantyUntil) {
        warrantyUntilDate = new Date(warrantyUntil);
        if (isNaN(warrantyUntilDate.getTime())) {
          return { ok: false, error: "วันที่ประกันไม่ถูกต้อง" };
        }
      }
    } catch (error) {
      console.error("Error parsing warranty data:", error);
      return { ok: false, error: "ข้อมูลประกันไม่ถูกต้อง" };
    }

    // Handle image upload
    const imageFile = formData.get("image") as File;
    let imageUrl = existingAsset.imageUrl;

    if (removeImage) {
      imageUrl = null;
    } else if (imageFile && imageFile.size > 0) {
      imageUrl = await handleImageUpload(imageFile);
    }

    // Update asset
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        sku,
        name,
        categoryId: categoryId ? parseInt(categoryId) : null,
        description: description || null,
        isSerialized,
        totalQty: isSerialized ? 0 : totalQty,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        warrantyMonths: warrantyMonthsNum,
        warrantyUntil: warrantyUntilDate,
        imageUrl,
      },
    });

    // สร้าง notification สำหรับการอัพเดตทรัพย์สิน
    try {
      const currentUser = await getCurrentUser();
      
      // สร้าง notification โดยตรง
      const employees = await prisma.employee.findMany({
        select: { id: true },
        where: { status: 'active' }
      });

      const notifications = employees.map((emp: { id: number }) => ({
        employeeId: emp.id,
        type: 'ASSET_UPDATED' as const,
        title: 'มีการอัพเดตทรัพย์สิน',
        message: `${currentUser.name} ได้อัพเดตข้อมูลทรัพย์สิน ${updatedAsset.name}`,
        data: { assetId: updatedAsset.id, assetName: updatedAsset.name, actionBy: currentUser.name }
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
      

    } catch (error) {
      console.error("Error creating asset update notification:", error);
      // ไม่ throw error เพื่อไม่ให้กระทบการอัพเดต asset
    }

    revalidatePath("/main/assets");
    return { ok: true, asset: updatedAsset };
  } catch (error) {
    console.error("Error updating asset:", error);

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string | string[] } };
      if (prismaError.code === 'P2002') {
        return { ok: false, error: "SKU นี้มีอยู่ในระบบแล้ว" };
      }
      if (prismaError.code === 'P2003') {
        return { ok: false, error: "หมวดหมู่ที่เลือกไม่มีอยู่ในระบบ" };
      }
      if (prismaError.code === 'P2025') {
        return { ok: false, error: "ไม่พบทรัพย์สินที่ต้องการแก้ไข" };
      }
    }

    return { ok: false, error: "เกิดข้อผิดพลาดในการแก้ไขทรัพย์สิน กรุณาลองใหม่อีกครั้ง" };
  }
}

// Delete Asset
export async function deleteAsset(formData: FormData) {
  try {

    const id = parseInt(formData.get("id") as string);

    if (!id) {
      return { ok: false, error: "ไม่พบ ID ของทรัพย์สิน" };
    }

    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
      include: {
        units: true,
      },
    });

    if (!existingAsset) {
      return { ok: false, error: "ไม่พบทรัพย์สิน" };
    }

    // Check if asset has units that are currently loaned
    // For now, we'll allow deletion of all assets
    // TODO: Implement proper loan checking when loan system is ready

    // Delete asset and related units
    await prisma.asset.delete({
      where: { id },
    });

    revalidatePath("/main/assets");
    return { ok: true };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการลบทรัพย์สิน" };
  }
}

// Add Asset Units
export async function addAssetUnits(formData: FormData) {
  try {
    const assetId = parseInt(formData.get("assetId") as string);
    const sns = formData.get("sns") as string;

    if (!assetId || !sns) {
      return { ok: false, error: "ข้อมูลไม่ครบถ้วน" };
    }

    // Check if asset exists and is serialized
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return { ok: false, error: "ไม่พบทรัพย์สิน" };
    }

    if (!asset.isSerialized) {
      return { ok: false, error: "ทรัพย์สินนี้ไม่ใช่แบบ Serialized" };
    }

    // Parse serial numbers
    const serialNumbers = sns
      .split("\n")
      .map((sn: string) => sn.trim())
      .filter(sn => sn.length > 0);

    if (serialNumbers.length === 0) {
      return { ok: false, error: "ไม่พบ Serial Number ที่ถูกต้อง" };
    }

    // Check for duplicate serial numbers
    const existingUnits = await prisma.assetUnit.findMany({
      where: {
        assetId,
        serialNumber: { in: serialNumbers },
      },
    });

    if (existingUnits.length > 0) {
      const duplicates = existingUnits.map((u: { serialNumber: string }) => u.serialNumber).join(", ");
      return { ok: false, error: `Serial Number นี้มีอยู่แล้ว: ${duplicates}` };
    }

    // Create units
    const createdUnits = await prisma.assetUnit.createMany({
      data: serialNumbers.map((sn: string) => ({
        assetId,
        serialNumber: sn,
        status: "ACTIVE",
      })),
    });

    revalidatePath("/main/assets");
    return { ok: true, inserted: createdUnits.count };
  } catch (error) {
    console.error("Error adding asset units:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการเพิ่ม Serial Number" };
  }
}

// Update Asset Unit
export async function updateAssetUnit(formData: FormData) {
  try {
    const id = parseInt(formData.get("id") as string);
    const status = formData.get("status") as string;
    const note = formData.get("note") as string;

    if (!id || !status) {
      return { ok: false, error: "ข้อมูลไม่ครบถ้วน" };
    }

    // Check if unit exists
    const existingUnit = await prisma.assetUnit.findUnique({
      where: { id },
    });

    if (!existingUnit) {
      return { ok: false, error: "ไม่พบ Serial Number" };
    }

    // Update unit
    const updatedUnit = await prisma.assetUnit.update({
      where: { id },
      data: {
        status: status as "ACTIVE" | "INACTIVE" | "LOST" | "BROKEN",
        note: note || null,
      },
    });

    revalidatePath("/main/assets");
    return { ok: true, unit: updatedUnit };
  } catch (error) {
    console.error("Error updating asset unit:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการแก้ไข Serial Number" };
  }
}

// Delete Asset Unit
export async function deleteAssetUnit(formData: FormData) {
  try {
    const id = parseInt(formData.get("id") as string);

    if (!id) {
      return { ok: false, error: "ไม่พบ ID ของ Serial Number" };
    }

    // Check if unit exists
    const existingUnit = await prisma.assetUnit.findUnique({
      where: { id },
    });

    if (!existingUnit) {
      return { ok: false, error: "ไม่พบ Serial Number" };
    }

    // TODO: Implement proper loan checking when loan system is ready
    // For now, we'll allow deletion of all units

    // Delete unit
    await prisma.assetUnit.delete({
      where: { id },
    });

    revalidatePath("/main/assets");
    return { ok: true };
  } catch (error) {
    console.error("Error deleting asset unit:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการลบ Serial Number" };
  }
}

// Get All Assets
export async function getAssets() {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        units: {
          where: {
            status: "ACTIVE",
            OR: [
              { loanItem: { is: null } },
              { loanItem: { is: { returnedAt: { not: null } } } }
            ]
          },
          select: { id: true, serialNumber: true, status: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return assets.map((asset: { id: number; sku: string; name: string; description: string | null; imageUrl: string | null; isSerialized: boolean; totalQty: number; status: string; purchasePrice: Decimal | null; purchaseDate: Date | null; warrantyMonths: number | null; warrantyUntil: Date | null; category: { id: number; name: string } | null; units: { id: number; status: string; serialNumber: string }[]; createdAt: Date; updatedAt: Date }) => ({
      id: asset.id,
      sku: asset.sku,
      name: asset.name,
      description: asset.description,
      isSerialized: asset.isSerialized,
      totalQty: asset.totalQty,
      availableQty: asset.isSerialized ? asset.units.length : asset.totalQty,
      availableUnits: asset.isSerialized ? asset.units : [],
      category: asset.category,
      purchaseDate: asset.purchaseDate?.toISOString().slice(0, 10) || null,
      purchasePrice: convertDecimal(asset.purchasePrice),
      warrantyMonths: asset.warrantyMonths,
      warrantyUntil: asset.warrantyUntil?.toISOString().slice(0, 10) || null,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error("Get assets error:", error);
    return [];
  }
}
