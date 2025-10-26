// src/actions/loans.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/actions/auth";

/* =========================
   เปิดใบยืมใหม่
========================= */

type CreateLoanInput = {
  borrowerId: number;
  dueDate?: string | null;
  note?: string | null;
};

type CreateLoanState = { ok: boolean; loanId: number | null; error: string | null };

export async function createLoan(input: CreateLoanInput): Promise<CreateLoanState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, loanId: null, error: "กรุณาเข้าสู่ระบบ" };

  const borrower = await prisma.employee.findUnique({
    where: { id: input.borrowerId },
    select: { id: true, status: true },
  });
  if (!borrower) return { ok: false, loanId: null, error: "ไม่พบพนักงาน" };
  if (borrower.status !== "active") {
    return { ok: false, loanId: null, error: "พนักงานไม่อยู่ในสถานะ active" };
  }

  const loan = await prisma.loan.create({
    data: {
      borrowerId: borrower.id,
      status: "OPEN",
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      note: input.note || null,
    },
    select: { id: true },
  });

  // สร้าง notification สำหรับการยืมของใหม่ (เพียงครั้งเดียว)
  try {
    const borrowerInfo = await prisma.employee.findUnique({
      where: { id: borrower.id },
      select: { name: true }
    });

    if (borrowerInfo) {
      // ตรวจสอบว่ามีการแจ้งเตือนสำหรับการยืมนี้แล้วหรือไม่
      const existingNotification = await prisma.notification.findFirst({
        where: {
          type: 'LOAN_CREATED',
          data: {
            path: ['loanId'],
            equals: loan.id
          },
          createdAt: {
            gte: new Date(Date.now() - 60000) // ภายใน 1 นาทีที่ผ่านมา
          }
        }
      });

      if (existingNotification) {
        console.log("🔔 Notification already exists for this loan creation, skipping");
      } else {
        const employees = await prisma.employee.findMany({
          select: { id: true },
          where: { status: 'active' }
        });

        const notifications = employees.map((emp: { id: number }) => ({
          employeeId: emp.id,
          type: 'LOAN_CREATED' as const,
          title: 'มีการยืมของใหม่',
          message: `${borrowerInfo.name} ได้สร้างใบยืมใหม่ #${loan.id}`,
          data: { loanId: loan.id, borrowerName: borrowerInfo.name }
        }));

        await prisma.notification.createMany({
          data: notifications,
        });

        console.log(`🔔 Created ${notifications.length} notifications for new loan: #${loan.id}`);
      }
    }
  } catch (error) {
    console.error("Error creating loan notification:", error);
    // ไม่ throw error เพื่อไม่ให้กระทบการสร้าง loan
  }

  revalidatePath("/main/loans");
  return { ok: true, loanId: loan.id, error: null };
}

/** ใช้กับ useActionState (prevState, formData) */
export async function createLoanByForm(
  _prev: CreateLoanState,
  formData: FormData
): Promise<CreateLoanState> {
  "use server";
  const borrowerId = Number(formData.get("borrowerId"));
  const dueDate = (formData.get("dueDate") as string) || null;
  const note = (formData.get("note") as string) || null;

  if (!borrowerId) return { ok: false, loanId: null, error: "กรุณาเลือกผู้ยืม" };
  return createLoan({ borrowerId, dueDate, note });
}

/* =========================
   เพิ่มรายการในใบยืม
========================= */

type AddLoanItemInput = {
  loanId: number;
  assetId: number;
  assetUnitId?: number;    // ถ้าเป็นของแบบ SN
  quantity?: number;       // ถ้าเป็นของแบบจำนวน
  startAt?: string | null;
  dueAt?: string | null;
};

type AddLoanItemState = { ok: boolean; error?: string | null };

export async function addLoanItem(input: AddLoanItemInput): Promise<AddLoanItemState & { item?: { id: number; assetId: number; assetUnitId: number | null; quantity: number; startAt: Date | null; dueAt: Date | null } }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "อนุญาตเฉพาะผู้มีสิทธิ์" };

  const { loanId, assetId, assetUnitId, quantity = 1, startAt, dueAt } = input;

  // 1) ตรวจใบยืม
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    select: { id: true, status: true },
  });
  if (!loan) return { ok: false, error: "ไม่พบใบยืม" };
  if (loan.status !== "OPEN") return { ok: false, error: "สถานะใบยืมไม่อนุญาตให้เพิ่มรายการ" };

  // 2) ตรวจทรัพย์สิน
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { isSerialized: true, status: true },
  });
  if (!asset) return { ok: false, error: "ไม่พบทรัพย์สิน" };
  if (asset.status !== "ACTIVE") return { ok: false, error: "ทรัพย์สินนี้ไม่พร้อมใช้งาน" };

  if (asset.isSerialized && !assetUnitId) {
    return { ok: false, error: "ทรัพย์สินนี้ต้องเลือก Serial Number" };
  }

  // 3) ตรวจ SN (ถ้าเป็น SN)
  if (asset.isSerialized && assetUnitId) {
    const unit = await prisma.assetUnit.findUnique({
      where: { id: assetUnitId },
      include: { loanItem: true },
    });
    if (!unit) return { ok: false, error: "ไม่พบ Serial Number" };
    if (unit.status !== "ACTIVE") return { ok: false, error: "SN นี้ไม่พร้อมใช้งาน" };
    if (unit.loanItem && unit.loanItem.returnedAt == null) {
      return { ok: false, error: "SN นี้ถูกยืมอยู่" };
    }
  }

  // 4) บันทึก
  try {
    const item = await prisma.loanItem.create({
      data: {
        loanId,
        assetId,
        assetUnitId: assetUnitId ?? null,
        quantity: asset.isSerialized ? 1 : quantity,
        startAt: startAt ? new Date(startAt) : null,
        dueAt: dueAt ? new Date(dueAt) : null,
      },
    });

    // revalidate หน้าเกี่ยวข้อง
    revalidatePath(`/main/loans/${loanId}`);
    revalidatePath(`/main/loans`);
    revalidatePath(`/main/assets`);

    return { ok: true, item };
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === "P2002") {
      return { ok: false, error: "SN นี้ถูกใช้งานแล้ว" };
    }
    return { ok: false, error: "เพิ่มรายการล้มเหลว" };
  }
}

/** helper: แปลง FormData → Input เดียวกัน */
function parseAddLoanItemForm(formData: FormData): AddLoanItemInput {
  const loanId = Number(formData.get("loanId"));
  const assetId = Number(formData.get("assetId"));
  const quantity = Number(formData.get("quantity") ?? 1) || 1;
  const rawUnit = formData.get("assetUnitId");
  const assetUnitId = rawUnit ? Number(rawUnit) : undefined;
  const startAt = (formData.get("startAt") as string) || null;
  const dueAt = (formData.get("dueAt") as string) || null;
  return { loanId, assetId, assetUnitId, quantity, startAt, dueAt };
}

/** ✅ สำหรับเรียก "ตรง" จาก client: addLoanItemByForm(formData) */
export async function addLoanItemByForm(formData: FormData) {
  "use server";
  const input = parseAddLoanItemForm(formData);
  if (!input.loanId || !input.assetId) return { ok: false, error: "ข้อมูลไม่ครบถ้วน" };
  return addLoanItem(input);
}

/** ✅ สำหรับใช้กับ useActionState: (prevState, formData) */
export async function addLoanItemByFormState(
  _prev: AddLoanItemState | null,
  formData: FormData
) {
  "use server";
  const input = parseAddLoanItemForm(formData);
  if (!input.loanId || !input.assetId) return { ok: false, error: "ข้อมูลไม่ครบถ้วน" };
  return addLoanItem(input);
}

/* =========================
   อัพเดตสถานะการยืม
========================= */

type UpdateLoanStatusInput = {
  loanId: number;
  status: 'OPEN' | 'USE' | 'CLOSED' | 'OVERDUE' | 'CANCELLED';
};

type UpdateLoanStatusState = { ok: boolean; error: string | null };

export async function updateLoanStatus(input: UpdateLoanStatusInput): Promise<UpdateLoanStatusState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  // ตรวจสอบว่า loan มีอยู่จริง
  const existingLoan = await prisma.loan.findUnique({
    where: { id: input.loanId },
    include: {
      borrower: {
        select: { name: true }
      }
    }
  });

  if (!existingLoan) {
    return { ok: false, error: "ไม่พบการยืม" };
  }

  // ตรวจสอบว่าสถานะเปลี่ยนหรือไม่
  if (existingLoan.status === input.status) {
    return { ok: false, error: "สถานะไม่เปลี่ยนแปลง" };
  }

  // อัพเดตสถานะ
  await prisma.loan.update({
    where: { id: input.loanId },
    data: { status: input.status }
  });

  // สร้าง notification สำหรับการเปลี่ยนสถานะ (เพียง 1 ครั้งต่อการเปลี่ยนแปลง)
  try {
    const statusMessages = {
      'OPEN': 'เปิดใช้งาน',
      'USE': 'กำลังใช้งาน',
      'CLOSED': 'ปิดการยืม',
      'OVERDUE': 'เกินกำหนด',
      'CANCELLED': 'ยกเลิก'
    };

    // สร้างการแจ้งเตือนเพียง 1 ครั้งสำหรับผู้ที่ทำการเปลี่ยนแปลง
    await prisma.notification.create({
      data: {
        employeeId: user.id,
        type: 'LOAN_STATUS_CHANGED',
        title: 'มีการเปลี่ยนสถานะการยืม',
        message: `การยืม #${input.loanId} ของ ${existingLoan.borrower.name} เปลี่ยนสถานะจาก ${statusMessages[existingLoan.status as keyof typeof statusMessages]} เป็น ${statusMessages[input.status]}`,
        data: { 
          loanId: input.loanId, 
          borrowerName: existingLoan.borrower.name,
          oldStatus: existingLoan.status,
          newStatus: input.status
        }
      }
    });

    console.log(`🔔 Created 1 notification for loan status change: ${existingLoan.status} -> ${input.status}`);
  } catch (error) {
    console.error("Error creating loan status notification:", error);
    // ไม่ throw error เพื่อไม่ให้กระทบการอัพเดตสถานะ
  }

  revalidatePath("/main/loans");
  revalidatePath(`/main/loans/${input.loanId}`);
  return { ok: true, error: null };
}

/** ใช้กับ useActionState (prevState, formData) */
export async function updateLoanStatusByForm(
  _prev: UpdateLoanStatusState,
  formData: FormData
): Promise<UpdateLoanStatusState> {
  "use server";
  const loanId = Number(formData.get("id"));
  const status = formData.get("status") as 'OPEN' | 'USE' | 'CLOSED' | 'OVERDUE' | 'CANCELLED';

  if (!loanId || !status) {
    return { ok: false, error: "ข้อมูลไม่ครบถ้วน" };
  }

  return updateLoanStatus({ loanId, status });
}

/* =========================
   แก้ไขรายการยืม
========================= */

type UpdateLoanInput = {
  loanId: number;
  borrowerId?: number;
  dueDate?: string | null;
  note?: string | null;
};

type UpdateLoanState = { ok: boolean; error: string | null };

export async function updateLoan(input: UpdateLoanInput): Promise<UpdateLoanState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  try {
    // ตรวจสอบว่าการยืมมีอยู่จริง
    const existingLoan = await prisma.loan.findUnique({
      where: { id: input.loanId },
      include: {
        borrower: { select: { name: true } }
      }
    });

    if (!existingLoan) {
      return { ok: false, error: "ไม่พบรายการยืม" };
    }

    // ตรวจสอบสถานะ - ไม่อนุญาตให้แก้ไขการยืมที่ปิดแล้ว
    if (existingLoan.status === 'CLOSED' || existingLoan.status === 'CANCELLED') {
      return { ok: false, error: "ไม่สามารถแก้ไขรายการยืมที่ปิดหรือยกเลิกแล้ว" };
    }

    // ตรวจสอบ borrower ใหม่ (ถ้ามี)
    if (input.borrowerId) {
      const borrower = await prisma.employee.findUnique({
        where: { id: input.borrowerId },
        select: { id: true, status: true, name: true },
      });
      
      if (!borrower) {
        return { ok: false, error: "ไม่พบพนักงาน" };
      }
      
      if (borrower.status !== "active") {
        return { ok: false, error: "พนักงานไม่อยู่ในสถานะ active" };
      }
    }

    // อัพเดตข้อมูลการยืม
    const updateData: {
      borrowerId?: number;
      dueDate?: Date | null;
      note?: string | null;
    } = {};
    if (input.borrowerId !== undefined) updateData.borrowerId = input.borrowerId;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.note !== undefined) updateData.note = input.note;

    await prisma.loan.update({
      where: { id: input.loanId },
      data: updateData
    });

    // สร้าง notification (เพียงครั้งเดียว)
    try {
      // ตรวจสอบว่ามีการแจ้งเตือนสำหรับการแก้ไขนี้แล้วหรือไม่
      const existingNotification = await prisma.notification.findFirst({
        where: {
          type: 'SYSTEM',
          data: {
            path: ['loanId'],
            equals: input.loanId
          },
          message: {
            contains: `รายการยืม #${input.loanId}`
          },
          createdAt: {
            gte: new Date(Date.now() - 60000) // ภายใน 1 นาทีที่ผ่านมา
          }
        }
      });

      if (existingNotification) {
        console.log("🔔 Notification already exists for this loan update, skipping");
      } else {
        const employees = await prisma.employee.findMany({
          where: { status: 'active' },
          select: { id: true }
        });

        const notifications = employees.map((emp: { id: number }) => ({
          employeeId: emp.id,
          type: 'SYSTEM' as const,
          title: 'มีการแก้ไขรายการยืม',
          message: `รายการยืม #${input.loanId} ของ ${existingLoan.borrower.name} ได้รับการแก้ไข`,
          data: { 
            loanId: input.loanId, 
            borrowerName: existingLoan.borrower.name,
            updatedFields: Object.keys(updateData)
          }
        }));

        await prisma.notification.createMany({
          data: notifications,
        });

        console.log(`🔔 Created ${notifications.length} notifications for loan update: #${input.loanId}`);
      }
    } catch (error) {
      console.error("Error creating loan update notification:", error);
    }

    revalidatePath("/main/loans");
    revalidatePath(`/main/loans/${input.loanId}`);
    return { ok: true, error: null };

  } catch (error) {
    console.error("Error updating loan:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการแก้ไขรายการยืม" };
  }
}

/** ใช้กับ useActionState (prevState, formData) */
export async function updateLoanByForm(
  _prev: UpdateLoanState,
  formData: FormData
): Promise<UpdateLoanState> {
  "use server";
  const loanId = Number(formData.get("loanId"));
  const borrowerId = formData.get("borrowerId") ? Number(formData.get("borrowerId")) : undefined;
  const dueDate = formData.get("dueDate") as string | null;
  const note = formData.get("note") as string | null;

  if (!loanId) {
    return { ok: false, error: "ไม่พบ ID รายการยืม" };
  }

  return updateLoan({ loanId, borrowerId, dueDate, note });
}

/* =========================
   ลบรายการยืม
========================= */

type DeleteLoanState = { ok: boolean; error: string | null };

export async function deleteLoan(loanId: number): Promise<DeleteLoanState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  try {
    // ตรวจสอบว่าการยืมมีอยู่จริง
    const existingLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        borrower: { select: { name: true } },
        items: { select: { id: true } }
      }
    });

    if (!existingLoan) {
      return { ok: false, error: "ไม่พบรายการยืม" };
    }

    // ตรวจสอบสถานะ - ไม่อนุญาตให้ลบการยืมที่มีรายการ
    if (existingLoan.items.length > 0) {
      return { ok: false, error: "ไม่สามารถลบรายการยืมที่มีรายการสินทรัพย์ได้ กรุณาลบรายการสินทรัพย์ก่อน" };
    }

    // ตรวจสอบสถานะ - ไม่อนุญาตให้ลบการยืมที่ปิดแล้ว
    if (existingLoan.status === 'CLOSED') {
      return { ok: false, error: "ไม่สามารถลบรายการยืมที่ปิดแล้ว" };
    }

    // ลบการยืม
    await prisma.loan.delete({
      where: { id: loanId }
    });

    // สร้าง notification
    try {
      const employees = await prisma.employee.findMany({
        where: { status: 'active' },
        select: { id: true }
      });

      const notifications = employees.map((emp: { id: number }) => ({
        employeeId: emp.id,
        type: 'SYSTEM' as const,
        title: 'มีการลบรายการยืม',
        message: `รายการยืม #${loanId} ของ ${existingLoan.borrower.name} ถูกลบ`,
        data: { 
          loanId: loanId, 
          borrowerName: existingLoan.borrower.name
        }
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    } catch (error) {
      console.error("Error creating loan delete notification:", error);
    }

    revalidatePath("/main/loans");
    return { ok: true, error: null };

  } catch (error) {
    console.error("Error deleting loan:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการลบรายการยืม" };
  }
}

/** ใช้กับ useActionState (prevState, formData) */
export async function deleteLoanByForm(
  _prev: DeleteLoanState,
  formData: FormData
): Promise<DeleteLoanState> {
  "use server";
  const loanId = Number(formData.get("loanId"));

  if (!loanId) {
    return { ok: false, error: "ไม่พบ ID รายการยืม" };
  }

  return deleteLoan(loanId);
}

/* =========================
   แก้ไขรายการสินทรัพย์ในการยืม
========================= */

type UpdateLoanItemInput = {
  loanItemId: number;
  assetId: number;
  quantity?: number;
  assetUnitId?: number | null;
  startAt?: string | null;
  dueAt?: string | null;
  returnedAt?: string | null;
  note?: string | null;
};

type UpdateLoanItemState = { ok: boolean; error: string | null };

export async function updateLoanItem(input: UpdateLoanItemInput): Promise<UpdateLoanItemState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  try {
    // ตรวจสอบรายการยืมที่มีอยู่
    const existingLoanItem = await prisma.loanItem.findUnique({
      where: { id: input.loanItemId },
      include: {
        loan: {
          include: {
            borrower: { select: { name: true } }
          }
        },
        asset: { select: { name: true, sku: true } }
      }
    });

    if (!existingLoanItem) {
      return { ok: false, error: "ไม่พบรายการยืม" };
    }

    // ตรวจสอบสถานะการยืม - ไม่อนุญาตให้แก้ไขรายการที่ปิดแล้ว
    if (existingLoanItem.loan.status === 'CLOSED' || existingLoanItem.loan.status === 'CANCELLED') {
      return { ok: false, error: "ไม่สามารถแก้ไขรายการยืมที่ปิดหรือยกเลิกแล้ว" };
    }

    // ตรวจสอบสินทรัพย์ใหม่
    const newAsset = await prisma.asset.findUnique({
      where: { id: input.assetId },
      include: {
        units: {
          where: { status: 'ACTIVE' },
          select: { id: true, serialNumber: true }
        },
        loanItems: {
          where: { returnedAt: null },
          select: { quantity: true }
        }
      }
    });

    if (!newAsset) {
      return { ok: false, error: "ไม่พบสินทรัพย์" };
    }

    // ตรวจสอบสถานะสินทรัพย์
    if (newAsset.status !== 'ACTIVE') {
      return { ok: false, error: "สินทรัพย์ไม่อยู่ในสถานะ ACTIVE" };
    }

    // ตรวจสอบจำนวนที่ต้องการ
    if (newAsset.isSerialized) {
      // สำหรับสินทรัพย์ที่มี Serial Number
      if (!input.assetUnitId) {
        return { ok: false, error: "กรุณาเลือก Serial Number" };
      }

      const selectedUnit = newAsset.units.find((unit: { id: number }) => unit.id === input.assetUnitId);
      if (!selectedUnit) {
        return { ok: false, error: "Serial Number ที่เลือกไม่พร้อมใช้งาน" };
      }
    } else {
      // สำหรับสินทรัพย์ที่ไม่มี Serial Number
      if (!input.quantity || input.quantity <= 0) {
        return { ok: false, error: "กรุณาระบุจำนวนที่ถูกต้อง" };
      }

      // คำนวณจำนวนที่พร้อมใช้งาน
      const borrowedQty = newAsset.loanItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
      const availableQty = newAsset.totalQty - borrowedQty;
      
      if (input.quantity > availableQty) {
        return { ok: false, error: `จำนวนที่ต้องการเกินจำนวนที่มี (มีเพียง ${availableQty} ชิ้น)` };
      }
    }

    // อัพเดทรายการยืม
    const updateData: {
      assetId: number;
      quantity?: number;
      assetUnitId?: number | null;
      startAt?: Date | null;
      dueAt?: Date | null;
      returnedAt?: Date | null;
      note?: string | null;
    } = {
      assetId: input.assetId,
      note: input.note
    };

    // เพิ่ม startAt, dueAt และ returnedAt ถ้ามี
    if (input.startAt !== undefined) {
      updateData.startAt = input.startAt ? new Date(input.startAt) : null;
    }
    if (input.dueAt !== undefined) {
      updateData.dueAt = input.dueAt ? new Date(input.dueAt) : null;
    }
    if (input.returnedAt !== undefined) {
      updateData.returnedAt = input.returnedAt ? new Date(input.returnedAt) : null;
    }

    if (newAsset.isSerialized) {
      updateData.assetUnitId = input.assetUnitId;
      updateData.quantity = 1; // สำหรับสินทรัพย์ที่มี Serial Number จำนวนจะเป็น 1 เสมอ
    } else {
      updateData.quantity = input.quantity;
      updateData.assetUnitId = null;
    }

    await prisma.loanItem.update({
      where: { id: input.loanItemId },
      data: updateData
    });

    // สร้าง notification (เพียงครั้งเดียว)
    try {
      // ตรวจสอบว่ามีการแจ้งเตือนสำหรับการแก้ไขนี้แล้วหรือไม่
      const existingNotification = await prisma.notification.findFirst({
        where: {
          type: 'SYSTEM',
          data: {
            path: ['loanId'],
            equals: existingLoanItem.loan.id
          },
          message: {
            contains: `รายการยืม #${existingLoanItem.loan.id}`
          },
          createdAt: {
            gte: new Date(Date.now() - 60000) // ภายใน 1 นาทีที่ผ่านมา
          }
        }
      });

      if (existingNotification) {
        console.log("🔔 Notification already exists for this loan item update, skipping");
      } else {
        const employees = await prisma.employee.findMany({
          where: { status: 'active' },
          select: { id: true }
        });

        const notifications = employees.map((emp: { id: number }) => ({
          employeeId: emp.id,
          type: 'SYSTEM' as const,
          title: 'มีการแก้ไขรายการสินทรัพย์ในการยืม',
          message: `รายการยืม #${existingLoanItem.loan.id} ของ ${existingLoanItem.loan.borrower.name} ได้รับการแก้ไขสินทรัพย์จาก ${existingLoanItem.asset.name} เป็น ${newAsset.name}`,
          data: {
            loanId: existingLoanItem.loan.id,
            borrowerName: existingLoanItem.loan.borrower.name,
            oldAsset: existingLoanItem.asset.name,
            newAsset: newAsset.name
          }
        }));

        await prisma.notification.createMany({
          data: notifications,
        });

        console.log(`🔔 Created ${notifications.length} notifications for loan item update: #${existingLoanItem.loan.id}`);
      }
    } catch (error) {
      console.error("Error creating loan item update notification:", error);
    }

    revalidatePath("/main/loans");
    revalidatePath(`/main/loans/${existingLoanItem.loan.id}`);
    return { ok: true, error: null };

  } catch (error) {
    console.error("Error updating loan item:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการแก้ไขรายการสินทรัพย์" };
  }
}

/** ใช้กับ useActionState (prevState, formData) */
export async function updateLoanItemByForm(
  _prev: UpdateLoanItemState,
  formData: FormData
): Promise<UpdateLoanItemState> {
  "use server";
  
  const loanItemId = Number(formData.get("loanItemId"));
  const assetId = Number(formData.get("assetId"));
  const quantity = formData.get("quantity") ? Number(formData.get("quantity")) : undefined;
  const assetUnitId = formData.get("assetUnitId") ? Number(formData.get("assetUnitId")) : null;
  const startAt = formData.get("startAt") as string | null;
  const dueAt = formData.get("dueAt") as string | null;
  const returnedAt = formData.get("returnedAt") as string | null;
  const note = formData.get("note") as string | null;

  if (!loanItemId || !assetId) {
    return { ok: false, error: "ข้อมูลไม่ครบถ้วน" };
  }

  return updateLoanItem({
    loanItemId,
    assetId,
    quantity,
    assetUnitId,
    startAt,
    dueAt,
    returnedAt,
    note
  });
}

/* =========================
   ลบรายการสินทรัพย์ในการยืม
========================= */

type DeleteLoanItemState = { ok: boolean; error: string | null };

export async function deleteLoanItem(loanItemId: number): Promise<DeleteLoanItemState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  try {
    // ตรวจสอบรายการยืมที่มีอยู่
    const existingLoanItem = await prisma.loanItem.findUnique({
      where: { id: loanItemId },
      include: {
        loan: {
          include: {
            borrower: { select: { name: true } }
          }
        },
        asset: { select: { name: true, sku: true } }
      }
    });

    if (!existingLoanItem) {
      return { ok: false, error: "ไม่พบรายการยืม" };
    }

    // ตรวจสอบสถานะการยืม - ไม่อนุญาตให้ลบรายการที่ปิดแล้ว
    if (existingLoanItem.loan.status === 'CLOSED' || existingLoanItem.loan.status === 'CANCELLED') {
      return { ok: false, error: "ไม่สามารถลบรายการยืมที่ปิดหรือยกเลิกแล้ว" };
    }

    // ลบรายการยืม
    await prisma.loanItem.delete({
      where: { id: loanItemId }
    });

    // สร้าง notification
    try {
      const employees = await prisma.employee.findMany({
        where: { status: 'active' },
        select: { id: true }
      });

      const notifications = employees.map((emp: { id: number }) => ({
        employeeId: emp.id,
        type: 'SYSTEM' as const,
        title: 'มีการลบรายการสินทรัพย์ในการยืม',
        message: `รายการยืม #${existingLoanItem.loan.id} ของ ${existingLoanItem.loan.borrower.name} ลบสินทรัพย์ ${existingLoanItem.asset.name}`,
        data: {
          loanId: existingLoanItem.loan.id,
          borrowerName: existingLoanItem.loan.borrower.name,
          deletedAsset: existingLoanItem.asset.name
        }
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    } catch (error) {
      console.error("Error creating loan item delete notification:", error);
    }

    revalidatePath("/main/loans");
    revalidatePath(`/main/loans/${existingLoanItem.loan.id}`);
    return { ok: true, error: null };

  } catch (error) {
    console.error("Error deleting loan item:", error);
    return { ok: false, error: "เกิดข้อผิดพลาดในการลบรายการสินทรัพย์" };
  }
}

/** ใช้กับ useActionState (prevState, formData) */
export async function deleteLoanItemByForm(
  _prev: DeleteLoanItemState,
  formData: FormData
): Promise<DeleteLoanItemState> {
  "use server";
  
  const loanItemId = Number(formData.get("loanItemId"));

  if (!loanItemId) {
    return { ok: false, error: "ไม่พบ ID รายการยืม" };
  }

  return deleteLoanItem(loanItemId);
}
