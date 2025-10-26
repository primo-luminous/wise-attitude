import { NextRequest, NextResponse } from "next/server";
import { getEmployees } from "@/app/actions/employees";

export async function GET(_req: NextRequest) {
  try {
    const employees = await getEmployees();
    
    // กรองเฉพาะพนักงานที่ active
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    
    return NextResponse.json(activeEmployees);
  } catch (error) {
    console.error("Get employees API error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน" },
      { status: 500 }
    );
  }
}
