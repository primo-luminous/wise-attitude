// src/app/main/loans/new/page.tsx
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import NewLoanClient from "../components/NewLoanClient";
import { getEmployees } from "@/actions/employees";
import { getAssets } from "@/actions/assets";

export const revalidate = 0;

export default async function NewLoanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?error=" + encodeURIComponent("กรุณาเข้าสู่ระบบใหม่"));
  }

  try {
    // ดึงข้อมูลพนักงานและ assets จากฐานข้อมูล
    const [employees, assets] = await Promise.all([getEmployees(), getAssets()]);

    // กรองเฉพาะพนักงานที่ active
    const activeEmployees = employees.filter((emp) => emp.status === "active");

    // 👉 ส่ง assets ทั้งหมดไปให้หน้า client เพื่อให้ dropdown หมวดหมู่แสดงครบ
    // แล้วให้หน้า NewLoanClient เป็นคนกรองเฉพาะรายการที่ "ยืมได้" เอง
    return <NewLoanClient employees={activeEmployees} assets={assets} />;
  } catch (error) {
    console.error("Error fetching data for new loan:", error);
    // Fallback to empty arrays if there's an error
    return <NewLoanClient employees={[]} assets={[]} />;
  }
}
