"use client";

import { PencilLine, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  id: number;
  name: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CategoryTableProps {
  categories: Category[];
  startIndex: number;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export default function CategoryTable({ categories, startIndex, onEdit, onDelete }: CategoryTableProps) {
  const { t } = useLanguage();

  const handleDelete = (id: number) => {
    if (confirm(t("คุณต้องการลบหมวดหมู่นี้หรือไม่?"))) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("ลำดับ")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("ชื่อหมวดหมู่")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("หมายเหตุ")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("วันที่สร้าง")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("วันที่อัปเดต")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("การดำเนินการ")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category, index) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {startIndex + index + 1}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {category.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {category.note || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(category.updatedAt).toLocaleDateString('th-TH')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-center gap-2">
                    {/* แก้ไข */}
                    <button
                      type="button"
                      onClick={() => onEdit(category)}
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
                      onClick={() => handleDelete(category.id)}
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
