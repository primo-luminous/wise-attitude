"use client";

import dayjs from "dayjs";
import { deletePosition } from "@/app/actions/positions";
import { showConfirm, showToast } from "@/lib/sweetalert";
import { PencilLine, Trash2 } from "lucide-react";

interface Position {
  id: number;
  nameTh: string | null;
  nameEn: string | null;
  description: string | null;
  level: number;
  departmentId: number | null;
  departmentLabel: string;
  createdAt: string;
  updatedAt: string;
}

interface PositionTableProps {
  positions: Position[];
  onEdit: (position: Position) => void;
}

export default function PositionTable({ positions, onEdit }: PositionTableProps) {
  const handleDelete = async (id: number) => {
    const result = await showConfirm(
      "ยืนยันการลบ",
      "คุณต้องการลบตำแหน่งนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้",
      "ลบ",
      "ยกเลิก"
    );

    if (!result.isConfirmed) return;

    const formData = new FormData();
    formData.append("id", id.toString());

    try {
      const response = await deletePosition(formData);
      if (response.ok) {
        showToast("ลบตำแหน่งสำเร็จ", "success");
        window.location.reload();
      } else {
        showToast(response.error || "เกิดข้อผิดพลาดในการลบ", "error");
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการลบ", "error");
    }
  };

  const headerCells = [
    <th key="no" className="w-20 font-semibold text-gray-700">ลำดับ</th>,
    <th key="nth" className="font-semibold text-gray-700">ชื่อตำแหน่ง (ไทย)</th>,
    <th key="nen" className="font-semibold text-gray-700">ชื่อตำแหน่ง (อังกฤษ)</th>,
    <th key="dept" className="font-semibold text-gray-700">แผนก</th>,
    <th key="level" className="w-24 font-semibold text-gray-700">ระดับ</th>,
    <th key="upd" className="w-48 font-semibold text-gray-700">อัปเดตล่าสุด</th>,
    <th key="act" className="w-40 font-semibold text-gray-700">การดำเนินการ</th>,
  ];

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-lg border border-gray-200">
      {/* ใส่ text-center ที่ตาราง และบังคับให้ th/td ทุกช่องจัดกลาง */}
      <table className="min-w-[880px] w-full text-sm text-center">
        <thead className="bg-gray-50">
          <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:text-center">
            {headerCells}
          </tr>
        </thead>

        <tbody className="[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-gray-100">
          {positions.map((position, idx) => (
            <tr
              key={position.id}
              className="[&>td]:px-3 [&>td]:py-3 [&>td]:text-center text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <td className="font-medium">{idx + 1}</td>
              <td className="font-medium">{position.nameTh || "-"}</td>
              <td className="font-medium">{position.nameEn || "-"}</td>
              <td>{position.departmentLabel}</td>

              <td>
                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {position.level}
                </span>
              </td>

              <td className="text-gray-600">
                {dayjs(position.updatedAt).format("YYYY-MM-DD HH:mm")}
              </td>

              <td>
                {/* จัดปุ่มให้อยู่กึ่งกลางคอลัมน์ */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(position)}
                    className="inline-flex items-center gap-2
                               text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200
                               hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100
                               font-medium rounded-lg text-sm px-4 py-2"
                    title="แก้ไข"
                  >
                    <PencilLine className="h-4 w-4" />
                    แก้ไข
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(position.id)}
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

          {positions.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                ไม่พบข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
