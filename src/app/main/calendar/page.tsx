import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?error=" + encodeURIComponent("กรุณาเข้าสู่ระบบใหม่"));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-1">ปฏิทินการยืมและคืนทรัพย์สิน</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">ปฏิทิน</h3>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">ปฏิทินจะแสดงที่นี่</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">การยืมที่ใกล้ครบกำหนด</h3>
          <div className="space-y-2">
            <p className="text-gray-500">ไม่มีรายการ</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">การยืมที่เกินกำหนด</h3>
          <div className="space-y-2">
            <p className="text-gray-500">ไม่มีรายการ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
