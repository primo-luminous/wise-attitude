import { prisma } from "@/lib/prisma";

export interface CreateNotificationData {
  employeeId: number;
  type: 'LOAN_CREATED' | 'LOAN_RETURNED' | 'LOAN_OVERDUE' | 'ASSET_ADDED' | 'ASSET_UPDATED' | 'SYSTEM';
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

// สร้าง notification ใหม่
export async function createNotification({
  employeeId,
  type,
  title,
  message,
  data
}: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        employeeId,
        type,
        title,
        message,
        data: data ? JSON.parse(JSON.stringify(data)) : null,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// สร้าง notification สำหรับการยืมของ
export async function createLoanNotification(
  employeeId: number,
  type: 'LOAN_CREATED' | 'LOAN_RETURNED' | 'LOAN_OVERDUE',
  loanId: number,
  borrowerName: string,
  assetNames: string[]
) {
  const notifications = {
    LOAN_CREATED: {
      title: "มีการยืมของใหม่",
      message: `${borrowerName} ได้ยืม ${assetNames.join(', ')}`
    },
    LOAN_RETURNED: {
      title: "มีการคืนของ",
      message: `${borrowerName} ได้คืน ${assetNames.join(', ')}`
    },
    LOAN_OVERDUE: {
      title: "การยืมของเกินกำหนด",
      message: `${borrowerName} ยังไม่ได้คืน ${assetNames.join(', ')}`
    }
  };

  return createNotification({
    employeeId,
    type,
    title: notifications[type].title,
    message: notifications[type].message,
    data: { loanId, borrowerName, assetNames }
  });
}

// สร้าง notification สำหรับการเพิ่มทรัพย์สิน
export async function createAssetNotification(
  employeeId: number,
  type: 'ASSET_ADDED' | 'ASSET_UPDATED',
  assetId: number,
  assetName: string,
  actionBy: string
) {
  const notifications = {
    ASSET_ADDED: {
      title: "มีการเพิ่มทรัพย์สินใหม่",
      message: `${actionBy} ได้เพิ่มทรัพย์สิน ${assetName} เข้าระบบ`
    },
    ASSET_UPDATED: {
      title: "มีการอัพเดตทรัพย์สิน",
      message: `${actionBy} ได้อัพเดตข้อมูลทรัพย์สิน ${assetName}`
    }
  };

  return createNotification({
    employeeId,
    type,
    title: notifications[type].title,
    message: notifications[type].message,
    data: { assetId, assetName, actionBy }
  });
}

// สร้าง notification สำหรับระบบ
export async function createSystemNotification(
  employeeId: number,
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  return createNotification({
    employeeId,
    type: 'SYSTEM',
    title,
    message,
    data
  });
}

// สร้าง notification ให้กับผู้ใช้ทุกคน (สำหรับ admin)
export async function createBroadcastNotification(
  type: 'LOAN_CREATED' | 'LOAN_RETURNED' | 'LOAN_OVERDUE' | 'ASSET_ADDED' | 'ASSET_UPDATED' | 'SYSTEM',
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  try {
    // ดึงรายชื่อ employee ทั้งหมด
    const employees = await prisma.employee.findMany({
      select: { id: true },
      where: { status: 'active' }
    });

    // สร้าง notification ให้กับทุกคน
    const notifications = employees.map(employee => ({
      employeeId: employee.id,
      type,
      title,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
    }));

    // สร้าง notifications ทั้งหมด
    const result = await prisma.notification.createMany({
      data: notifications,
    });

    return { success: true, count: notifications.length };
  } catch (error) {
    console.error("Error creating broadcast notification:", error);
    throw error;
  }
}
