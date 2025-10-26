// app/main/profile/ProfileClient.tsx
"use client";

import { useMemo, useState } from "react";
import { User, MapPin, Edit, Save, X } from "lucide-react";
import { showSuccess, showError } from "@/lib/sweetalert";
import { saveMyProfile } from "@/actions/profile";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

type ProfileData = {
  id?: number;
  employeeID?: string;
  titlePrefix?: string;
  name: string;
  nickname?: string;
  citizenID?: string;
  email: string;
  mustChangePassword?: boolean;
  imageUrl?: string;
  ppPhone?: string;
  wPhone?: string;
  birthday?: string;       // YYYY-MM-DD
  status?: "active" | "inactive" | "suspended";
  departmentId?: number;
  positionId?: number;
  address?: string;
  dayOff?: string;
  educationLevel?: string;
  major?: string;
  bankName?: string;
  bankAccountNumber?: string;
  socialSecurityStart?: string;  // YYYY-MM-DD
  university?: string;
  createdAt?: string;      // YYYY-MM-DD
  updatedAt?: string;      // YYYY-MM-DD
  department: string;
  position: string;
  // Legacy fields for backward compatibility
  phone?: string;
  avatar?: string;
  startDate?: string;     // YYYY-MM-DD
};

type SaveState = { ok: boolean; error?: string; stamp?: number };

export default function ProfileClient({ initialProfile }: { initialProfile: ProfileData }) {
  // โหลดจาก server แล้ว ไม่ต้อง fake loading
  const [isLoading, setIsLoading] = useState(false);

  // โหมดแก้ไข
  const [isEditing, setIsEditing] = useState(false);

  // state แสดงผลจริง
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  // state แบบฟอร์มเวลาจะแก้ไข
  const [editForm, setEditForm] = useState<ProfileData>(initialProfile);

  // ใช้ state สำหรับการบันทึก
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // สร้าง FormData จาก editForm
      const formData = new FormData();
      formData.append('name', editForm.name);
      if (editForm.titlePrefix) formData.append('titlePrefix', editForm.titlePrefix);
      if (editForm.nickname) formData.append('nickname', editForm.nickname);
      if (editForm.citizenID) formData.append('citizenID', editForm.citizenID);
      if (editForm.ppPhone) formData.append('ppPhone', editForm.ppPhone);
      if (editForm.wPhone) formData.append('wPhone', editForm.wPhone);
      if (editForm.address) formData.append('address', editForm.address);
      if (editForm.birthday) formData.append('birthday', editForm.birthday);
      if (editForm.dayOff) formData.append('dayOff', editForm.dayOff);
      if (editForm.educationLevel) formData.append('educationLevel', editForm.educationLevel);
      if (editForm.university) formData.append('university', editForm.university);
      if (editForm.major) formData.append('major', editForm.major);
      if (editForm.bankName) formData.append('bankName', editForm.bankName);
      if (editForm.bankAccountNumber) formData.append('bankAccountNumber', editForm.bankAccountNumber);

      // เรียก server action
      const result = await saveMyProfile({ ok: false, stamp: Date.now() }, formData);
      
      if (result.ok) {
        // อัปเดต state ให้ตรงกับค่าที่กรอกในฟอร์ม
        setProfile((prev) => ({ ...prev, ...editForm }));
        setIsEditing(false);
        showSuccess("อัปเดตโปรไฟล์สำเร็จ");
      } else {
        setSaveError(result.error || "เกิดข้อผิดพลาดในการบันทึก");
        showError(result.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveError("เกิดข้อผิดพลาดในการบันทึก");
      showError("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const onStartEdit = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  const onCancel = () => {
    setIsEditing(false);
    setEditForm(profile);
  };

  const setField = (key: keyof ProfileData, value: string) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  // UI: สีก้อนสถานะ
  const statusBadge = useMemo(() => {
    const st = profile.status ?? "active";
    if (st === "active") return "bg-green-100 text-green-800";
    if (st === "suspended") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-200 text-gray-700";
  }, [profile.status]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="w-32 h-32 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton height="32px" className="w-48 mx-auto" />
            <Skeleton height="20px" className="w-64 mx-auto" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          {profile.titlePrefix && `${profile.titlePrefix} `}{profile.name}
          {profile.nickname && ` (${profile.nickname})`}
        </h1>
        <p className="text-gray-600 mt-2">
          {profile.position} • {profile.department}
        </p>
        {profile.employeeID && (
          <p className="text-sm text-gray-500 mt-1">
            รหัสพนักงาน: {profile.employeeID}
          </p>
        )}

        {/* สถานะและวันเริ่มต้นงาน */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge}`}>
            {profile.status === "active"
              ? "ใช้งาน"
              : profile.status === "suspended"
              ? "ระงับใช้งาน"
              : "ไม่ใช้งาน"}
          </span>
          {profile.startDate && (
            <span className="text-sm text-gray-500">
              เริ่มงาน: {new Date(profile.startDate).toLocaleDateString("th-TH")}
            </span>
          )}
        </div>
      </div>

      {/* ข้อมูล + ฟอร์มบันทึก */}
      <div className="grid grid-cols-1 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            ข้อมูลส่วนตัว
          </h2>

          <div className="space-y-4">
            {/* รหัสพนักงาน */}
            {profile.employeeID && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสพนักงาน
                </label>
                <p className="text-gray-900">{profile.employeeID}</p>
              </div>
            )}

            {/* คำนำหน้า */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำนำหน้า
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="titlePrefix"
                  value={editForm.titlePrefix || ""}
                  onChange={(e) => setField("titlePrefix", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="นาย/นาง/นางสาว"
                />
              ) : (
                <p className="text-gray-900">{profile.titlePrefix || "-"}</p>
              )}
            </div>

            {/* ชื่อ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ-นามสกุล
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="text-gray-900">{profile.name}</p>
              )}
            </div>

            {/* ชื่อเล่น */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อเล่น
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="nickname"
                  value={editForm.nickname || ""}
                  onChange={(e) => setField("nickname", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.nickname || "-"}</p>
              )}
            </div>

            {/* เลขบัตรประชาชน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เลขบัตรประชาชน
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="citizenID"
                  value={editForm.citizenID || ""}
                  onChange={(e) => setField("citizenID", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234567890123"
                />
              ) : (
                <p className="text-gray-900">{profile.citizenID || "-"}</p>
              )}
            </div>

            {/* อีเมล */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  defaultValue={profile.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.email}</p>
              )}
            </div>

            {/* เบอร์โทรศัพท์ส่วนตัว */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์ส่วนตัว
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="ppPhone"
                  value={editForm.ppPhone || ""}
                  onChange={(e) => setField("ppPhone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="081-234-5678"
                />
              ) : (
                <p className="text-gray-900">{profile.ppPhone || "-"}</p>
              )}
            </div>

            {/* เบอร์โทรศัพท์ที่ทำงาน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์ที่ทำงาน
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="wPhone"
                  value={editForm.wPhone || ""}
                  onChange={(e) => setField("wPhone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="02-123-4567"
                />
              ) : (
                <p className="text-gray-900">{profile.wPhone || "-"}</p>
              )}
            </div>

            {/* ที่อยู่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ที่อยู่
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={(e) => setField("address", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.address}</p>
              )}
            </div>

            {/* วันเกิด */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันเกิด
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="birthday"
                  value={editForm.birthday || ""}
                  onChange={(e) => setField("birthday", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.birthday
                    ? new Date(profile.birthday).toLocaleDateString("th-TH")
                    : "-"}
                </p>
              )}
            </div>

            {/* อัปโหลดรูป */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รูปโปรไฟล์
                </label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Work Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            ข้อมูลการทำงาน
          </h2>

          <div className="space-y-4">
            {/* แผนก */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                แผนก
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="department" // แสดงผลเฉยๆ ไม่ได้บันทึกโดยตรง (ฝั่ง server action บันทึก departmentId)
                  value={editForm.department}
                  onChange={(e) => setField("department", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              ) : (
                <p className="text-gray-900">{profile.department || "-"}</p>
              )}
            </div>

            {/* ตำแหน่ง */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ตำแหน่ง
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="position" // แสดงผลเฉยๆ ไม่ได้บันทึกโดยตรง (ฝั่ง server action บันทึก positionId)
                  value={editForm.position}
                  onChange={(e) => setField("position", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              ) : (
                <p className="text-gray-900">{profile.position || "-"}</p>
              )}
            </div>

            {/* วันหยุดประจำ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันหยุดประจำ
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="dayOff"
                  value={editForm.dayOff || ""}
                  onChange={(e) => setField("dayOff", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="อาทิตย์"
                />
              ) : (
                <p className="text-gray-900">{profile.dayOff || "-"}</p>
              )}
            </div>

            {/* วันที่เริ่มงาน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่เริ่มงาน
              </label>
              <p className="text-gray-900">
                {profile.socialSecurityStart
                  ? new Date(profile.socialSecurityStart).toLocaleDateString("th-TH")
                  : profile.startDate
                  ? new Date(profile.startDate).toLocaleDateString("th-TH")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* ข้อมูลการศึกษา */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            ข้อมูลการศึกษา
          </h2>

          <div className="space-y-4">
            {/* ระดับการศึกษา */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ระดับการศึกษา
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="educationLevel"
                  value={editForm.educationLevel || ""}
                  onChange={(e) => setField("educationLevel", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ปริญญาตรี"
                />
              ) : (
                <p className="text-gray-900">{profile.educationLevel || "-"}</p>
              )}
            </div>

            {/* มหาวิทยาลัย */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                มหาวิทยาลัย
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="university"
                  value={editForm.university || ""}
                  onChange={(e) => setField("university", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา"
                />
              ) : (
                <p className="text-gray-900">{profile.university || "-"}</p>
              )}
            </div>

            {/* สาขาวิชา */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สาขาวิชา
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="major"
                  value={editForm.major || ""}
                  onChange={(e) => setField("major", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ระบบสารสนเทศทางคอมพิวเตอร์"
                />
              ) : (
                <p className="text-gray-900">{profile.major || "-"}</p>
              )}
            </div>
          </div>
        </div>

        {/* ข้อมูลธนาคาร */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            ข้อมูลธนาคาร
          </h2>

          <div className="space-y-4">
            {/* ชื่อธนาคาร */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อธนาคาร
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankName"
                  value={editForm.bankName || ""}
                  onChange={(e) => setField("bankName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กสิกรไทย"
                />
              ) : (
                <p className="text-gray-900">{profile.bankName || "-"}</p>
              )}
            </div>

            {/* เลขบัญชี */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เลขบัญชี
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={editForm.bankAccountNumber || ""}
                  onChange={(e) => setField("bankAccountNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0962702767"
                />
              ) : (
                <p className="text-gray-900">{profile.bankAccountNumber || "-"}</p>
              )}
            </div>
          </div>
        </div>

        {/* ปุ่มบันทึก/ยกเลิก */}
        <div className="flex justify-center space-x-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={saving}
              >
                <Save size={16} />
                <span>{saving ? "กำลังบันทึก..." : "บันทึก"}</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={16} />
                <span>ยกเลิก</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStartEdit}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={16} />
              <span>แก้ไขโปรไฟล์</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
