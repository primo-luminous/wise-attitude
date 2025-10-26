import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

// GET /api/notifications - ดึงรายการ notifications
export async function GET(_request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ดึง notifications ล่าสุด 50 รายการ
    const notifications = await prisma.notification.findMany({
      where: {
        employeeId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        isRead: true,
        data: true,
        createdAt: true,
        readAt: true,
      },
    });

    // นับจำนวนที่ยังไม่ได้อ่าน
    const unreadCount = await prisma.notification.count({
      where: {
        employeeId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    
    // ถ้าเป็น error เกี่ยวกับ authentication ให้ส่ง 401
    if (error instanceof Error && error.message.includes("session")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - สร้าง notification ใหม่
export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { type, title, message, data } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // สร้าง notification
    const notification = await prisma.notification.create({
      data: {
        employeeId: user.id,
        type,
        title,
        message,
        data: data || null,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
