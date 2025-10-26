import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function SuppliersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?error=" + encodeURIComponent("กรุณาเข้าสู่ระบบใหม่"));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">จัดการข้อมูลผู้จำหน่าย</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          เพิ่มผู้จำหน่าย
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">รายการผู้จำหน่าย</h3>
          <div className="text-center py-12">
            <p className="text-gray-500">ยังไม่มีข้อมูลผู้จำหน่าย</p>
            <p className="text-gray-400 text-sm mt-2">คลิกปุ่ม &quot;เพิ่มผู้จำหน่าย&quot; เพื่อเริ่มต้น</p>
          </div>
        </div>
      </div>
    </div>
  );
}
