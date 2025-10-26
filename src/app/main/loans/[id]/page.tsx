// src/app/main/loans/[id]/page.tsx
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

import LoanDetailClient from "../components/LoanDetailClient";
import { prisma } from "@/lib/db";
import { getEmployees } from "@/actions/employees";
import { getAssets } from "@/actions/assets";

export const revalidate = 0;

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?error=" + encodeURIComponent("กรุณาเข้าสู่ระบบใหม่"));
  }

  const resolvedParams = await params;
  const loanId = Number(resolvedParams.id);
  if (!Number.isFinite(loanId)) {
    redirect("/main/loans?error=" + encodeURIComponent("ID การยืมไม่ถูกต้อง"));
  }

  let loan = null;
  try {
    loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        borrower: { 
          select: { 
            id: true, 
            name: true, 
            employeeID: true,
            position: { select: { nameEn: true } }
          } 
        },
        items: {
          include: {
            asset: { select: { id: true, sku: true, name: true, isSerialized: true } },
            assetUnit: { select: { id: true, serialNumber: true } },
          },
        },
      },
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && (error as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error("DB error fetching loan:", error);
    redirect("/main/loans?error=" + encodeURIComponent("เกิดข้อผิดพลาดในการดึงข้อมูล"));
  }

  if (!loan) {
    redirect("/main/loans?error=" + encodeURIComponent("ไม่พบข้อมูลการยืม"));
  }

  const [employees, assets] = await Promise.all([getEmployees(), getAssets()]);
  const activeEmployees = employees.filter((e) => e.status === "active");

  const categories = Array.from(new Set(assets.filter(a => a.category).map(a => a.category!.id)))
    .map((categoryId) => {
      const a = assets.find((x) => x.category?.id === categoryId);
      return { id: categoryId, name: a?.category?.name || "ไม่ระบุ" };
    });

  const formattedLoan = {
    id: loan.id,
    status: loan.status,
    returnedDate: null, // ไม่มี returnedDate ใน Loan model
    dueDate: loan.dueDate?.toISOString().slice(0, 10) || null,
    note: loan.note || "",
    borrower: {
      id: loan.borrower.id,
      name: loan.borrower.name,
      employeeID: loan.borrower.employeeID,
    },
    borrowerPosition: loan.borrower.position?.nameEn || null,
    items: loan.items.map((item) => ({
      id: item.id,
      sku: item.asset.sku,
      name: item.asset.name,
      isSerialized: item.asset.isSerialized,
      serialNumber: item.assetUnit?.serialNumber || undefined,
      quantity: item.quantity,
      startAt: item.startAt?.toISOString().slice(0, 10) || undefined,
      dueAt: item.dueAt?.toISOString().slice(0, 10) || null,
      returnedAt: item.returnedAt?.toISOString().slice(0, 10) || null,
      note: item.note || null,
    })),
  };

  return (
    <LoanDetailClient
      loan={formattedLoan}
      employees={activeEmployees}
      assets={assets}
      categories={categories}
    />
  );
}
