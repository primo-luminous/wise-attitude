import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?error=" + encodeURIComponent("กรุณาเข้าสู่ระบบใหม่"));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        <p className="text-gray-600 mt-1">จัดการเอกสารและรายงาน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-gray-900 mb-2">รายงานการยืม</h3>
          <p className="text-gray-600 text-sm">สร้างรายงานการยืมทรัพย์สิน</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-gray-900 mb-2">รายงานทรัพย์สิน</h3>
          <p className="text-gray-600 text-sm">สร้างรายงานทรัพย์สินทั้งหมด</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-gray-900 mb-2">รายงานพนักงาน</h3>
          <p className="text-gray-600 text-sm">สร้างรายงานข้อมูลพนักงาน</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-gray-900 mb-2">รายงานการคืน</h3>
          <p className="text-gray-600 text-sm">สร้างรายงานการคืนทรัพย์สิน</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-gray-900 mb-2">รายงานเกินกำหนด</h3>
          <p className="text-gray-600 text-sm">สร้างรายงานการยืมเกินกำหนด</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-gray-900 mb-2">รายงานสรุป</h3>
          <p className="text-gray-600 text-sm">สร้างรายงานสรุปภาพรวม</p>
        </div>
      </div>
    </div>
  );
}
