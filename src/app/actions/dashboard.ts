"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";

export interface DashboardStats {
  totalEmployees: number;
  totalAssets: number;
  totalLoans: number;
  overdueLoans: number;
  activeEmployees: number;
  inactiveEmployees: number;
  activeAssets: number;
  inactiveAssets: number;
  openLoans: number;
  closedLoans: number;
  useLoans: number;
  cancelledLoans: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("กรุณาเข้าสู่ระบบ");
  }

  try {
    // ดึงข้อมูลสถิติทั้งหมดพร้อมกัน
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalAssets,
      activeAssets,
      inactiveAssets,
      totalLoans,
      openLoans,
      useLoans,
      closedLoans,
      cancelledLoans,
      overdueLoans
    ] = await Promise.all([
      // พนักงาน
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'active' } }),
      prisma.employee.count({ where: { status: 'inactive' } }),
      
      // ทรัพย์สิน
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'ACTIVE' } }),
      prisma.asset.count({ where: { status: 'INACTIVE' } }),
      
      // การยืม
      prisma.loan.count(),
      prisma.loan.count({ where: { status: 'OPEN' } }),
      prisma.loan.count({ where: { status: 'USE' } }),
      prisma.loan.count({ where: { status: 'CLOSED' } }),
      prisma.loan.count({ where: { status: 'CANCELLED' } }),
      prisma.loan.count({ where: { status: 'OVERDUE' } })
    ]);

    return {
      totalEmployees,
      totalAssets,
      totalLoans,
      overdueLoans,
      activeEmployees,
      inactiveEmployees,
      activeAssets,
      inactiveAssets,
      openLoans,
      closedLoans,
      useLoans,
      cancelledLoans
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error("ไม่สามารถดึงข้อมูลสถิติได้");
  }
}

export interface RecentActivity {
  id: string;
  type: 'LOAN_CREATED' | 'LOAN_RETURNED' | 'LOAN_OVERDUE' | 'LOAN_STATUS_CHANGED' | 'ASSET_ADDED' | 'ASSET_UPDATED' | 'SYSTEM';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface MonthlyLoanData {
  month: string;
  count: number;
  monthNumber: number;
}

export async function getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("กรุณาเข้าสู่ระบบ");
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        employeeId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        createdAt: true,
        isRead: true
      }
    });

    return notifications.map((notification: { id: string; type: string; title: string; message: string; isRead: boolean; createdAt: Date }) => ({
      id: notification.id,
      type: notification.type as 'LOAN_CREATED' | 'LOAN_RETURNED' | 'LOAN_OVERDUE' | 'LOAN_STATUS_CHANGED' | 'ASSET_ADDED' | 'ASSET_UPDATED' | 'SYSTEM',
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt.toISOString(),
      isRead: notification.isRead
    }));
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

export async function getMonthlyLoanData(year: number = new Date().getFullYear()): Promise<MonthlyLoanData[]> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("กรุณาเข้าสู่ระบบ");
  }

  try {
    // สร้างข้อมูลสำหรับ 12 เดือน
    const months = [
      { name: 'ม.ค.', number: 1 },
      { name: 'ก.พ.', number: 2 },
      { name: 'มี.ค.', number: 3 },
      { name: 'เม.ย.', number: 4 },
      { name: 'พ.ค.', number: 5 },
      { name: 'มิ.ย.', number: 6 },
      { name: 'ก.ค.', number: 7 },
      { name: 'ส.ค.', number: 8 },
      { name: 'ก.ย.', number: 9 },
      { name: 'ต.ค.', number: 10 },
      { name: 'พ.ย.', number: 11 },
      { name: 'ธ.ค.', number: 12 }
    ];

    // ดึงข้อมูลการยืมในแต่ละเดือน
    const monthlyData = await Promise.all(
      months.map(async (month) => {
        const startDate = new Date(year, month.number - 1, 1);
        const endDate = new Date(year, month.number, 0, 23, 59, 59);

        const count = await prisma.loan.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        });

        return {
          month: month.name,
          count,
          monthNumber: month.number
        };
      })
    );

    return monthlyData;
  } catch (error) {
    console.error('Error fetching monthly loan data:', error);
    throw new Error("ไม่สามารถดึงข้อมูลการยืมรายเดือนได้");
  }
}
