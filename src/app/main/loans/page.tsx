import { getCurrentUser } from "../../actions/auth";
import { redirect } from "next/navigation";
import LoansClient from "./components/LoansClient";
import { prisma } from "../../../lib/db";

export const dynamic = 'force-dynamic';

export default async function LoansPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login?error=" + encodeURIComponent("กรุณาเข้าสู่ระบบใหม่"));
  }

  try {
    // ดึงข้อมูลการยืมจากฐานข้อมูล
    const loans = await prisma.loan.findMany({
      include: {
        borrower: {
          select: {
            id: true,
            name: true,
            employeeID: true
          }
        },
        items: {
          select: {
            id: true,
            quantity: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // แปลงข้อมูลให้ตรงกับ interface ที่ต้องการ
    const formattedLoans = loans.map(loan => ({
      id: loan.id,
      status: loan.status === "USE" ? "OPEN" : loan.status,
      dueDate: loan.dueDate?.toISOString().slice(0, 10) || null,
      itemsCount: loan.items.reduce((sum, item) => sum + item.quantity, 0),
      borrower: {
        id: loan.borrower.id,
        name: loan.borrower.name,
        employeeID: loan.borrower.employeeID
      },
      note: loan.note,
      createdAt: loan.createdAt.toISOString()
    }));

    return <LoansClient data={formattedLoans} />;
  } catch (error) {
    console.error("Error fetching loans:", error);
    // Fallback to empty array if there's an error
    return <LoansClient data={[]} />;
  }
}
