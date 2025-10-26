"use client";

import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { deleteDepartment } from "@/app/actions/departments";
import { showConfirm, showToast } from "@/lib/sweetalert";
import { PencilLine, Trash2 } from "lucide-react";

interface Department {
  id: number;
  nameTh: string | null;
  nameEn: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
}

export default function DepartmentTable({ departments, onEdit }: DepartmentTableProps) {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    const result = await showConfirm(
      "ยืนยันการลบ",
      "คุณต้องการลบแผนกนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้",
      "ลบ",
      "ยกเลิก"
    );

    if (!result.isConfirmed) return;

    const formData = new FormData();
    formData.append("id", String(id));

    try {
      const response = await deleteDepartment(formData);
      if (response.ok) {
        showToast("ลบแผนกสำเร็จ", "success");
        router.refresh();
      } else {
        showToast(response.error || "เกิดข้อผิดพลาดในการลบ", "error");
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการลบ", "error");
    }
  };

  const headerCells = [
    <th key="no"  className="w-20 font-semibold text-gray-700">ลำดับ</th>,
    <th key="nth" className="font-semibold text-gray-700">ชื่อแผนก (ไทย)</th>,
    <th key="nen" className="font-semibold text-gray-700">ชื่อแผนก (อังกฤษ)</th>,
    <th key="desc" className="font-semibold text-gray-700">คำอธิบาย</th>,
    <th key="upd" className="w-48 font-semibold text-gray-700">อัปเดตล่าสุด</th>,
    <th key="act" className="w-36 font-semibold text-gray-700">การดำเนินการ</th>,
  ];

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-lg border border-gray-200">
      <table className="min-w-[720px] w-full text-sm text-center">
        <thead className="bg-gray-50">
          <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:text-center">{headerCells}</tr>
        </thead>
        <tbody className="[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-gray-100">
          {departments.map((department, idx) => (
            <tr
              key={department.id}
              className="[&>td]:px-3 [&>td]:py-3 [&>td]:text-center text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <td className="font-medium">{idx + 1}</td>
              <td className="font-medium">{department.nameTh || "-"}</td>
              <td className="font-medium">{department.nameEn || "-"}</td>

              {/* คำอธิบาย — จำกัดความกว้าง + ตัดคำ + จัดกลาง */}
              <td
                className="max-w-[320px] truncate mx-auto"
                title={department.description || ""}
              >
                {department.description || "-"}
              </td>

              <td className="text-gray-600">
                {dayjs(department.updatedAt).format("YYYY-MM-DD HH:mm")}
              </td>

              <td>
                <div className="flex items-center justify-center gap-2">
                  {/* แก้ไข */}
                  <button
                    type="button"
                    onClick={() => onEdit(department)}
                    className="inline-flex items-center gap-2
                               text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200
                               hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100
                               font-medium rounded-lg text-sm px-4 py-2"
                    title="แก้ไข"
                  >
                    <PencilLine className="h-4 w-4" />
                    แก้ไข
                  </button>

                  {/* ลบ */}
                  <button
                    type="button"
                    onClick={() => handleDelete(department.id)}
                    className="inline-flex items-center gap-2
                               text-white bg-gradient-to-br from-pink-500 to-orange-400
                               hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200
                               font-medium rounded-lg text-sm px-4 py-2"
                    title="ลบ"
                  >
                    <Trash2 className="h-4 w-4" />
                    ลบ
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {departments.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                ไม่พบข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
