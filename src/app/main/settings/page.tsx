import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?error=" + encodeURIComponent("กรุณาเข้าสู่ระบบใหม่"));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">การตั้งค่าระบบ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">การตั้งค่าทั่วไป</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อบริษัท</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Wise Attitude"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="ที่อยู่บริษัท"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
              <input 
                type="tel" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="02-xxx-xxxx"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">การตั้งค่าระบบ</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">การแจ้งเตือนอัตโนมัติ</h4>
                <p className="text-sm text-gray-600">ส่งการแจ้งเตือนเมื่อมีการยืม/คืน</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">การแจ้งเตือนเกินกำหนด</h4>
                <p className="text-sm text-gray-600">ส่งการแจ้งเตือนเมื่อการยืมเกินกำหนด</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">การสำรองข้อมูลอัตโนมัติ</h4>
                <p className="text-sm text-gray-600">สำรองข้อมูลทุกวัน</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">การจัดการข้อมูล</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <h4 className="font-medium text-gray-900">สำรองข้อมูล</h4>
            <p className="text-sm text-gray-600 mt-1">ดาวน์โหลดข้อมูลทั้งหมด</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <h4 className="font-medium text-gray-900">กู้คืนข้อมูล</h4>
            <p className="text-sm text-gray-600 mt-1">อัพโหลดไฟล์สำรอง</p>
          </button>
          <button className="p-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <h4 className="font-medium">ลบข้อมูลทั้งหมด</h4>
            <p className="text-sm mt-1">ลบข้อมูลทั้งหมดในระบบ</p>
          </button>
        </div>
      </div>
    </div>
  );
}
