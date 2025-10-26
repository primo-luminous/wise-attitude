"use client";

import { useState } from "react";
import { useActionState } from "react";
import { X, Save } from "lucide-react";
import { updateLoanStatusByForm } from "@/actions/loans";
import { showSuccess, showError } from "@/lib/sweetalert";

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: number;
  currentStatus: string;
  borrowerName: string;
}

type UpdateLoanStatusState = { ok: boolean; error: string | null };

const initialStatusState: UpdateLoanStatusState = { ok: false, error: null };

const statusOptions = [
  { value: 'OPEN', label: 'เปิดใช้งาน', color: 'bg-green-100 text-green-800' },
  { value: 'USE', label: 'กำลังใช้งาน', color: 'bg-blue-100 text-blue-800' },
  { value: 'CLOSED', label: 'ปิดการยืม', color: 'bg-gray-100 text-gray-800' },
  { value: 'OVERDUE', label: 'เกินกำหนด', color: 'bg-red-100 text-red-800' },
  { value: 'CANCELLED', label: 'ยกเลิก', color: 'bg-orange-100 text-orange-800' }
];

export default function StatusUpdateModal({
  isOpen,
  onClose,
  loanId,
  currentStatus,
  borrowerName
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [, updateAction, isUpdating] = useActionState<UpdateLoanStatusState, FormData>(
    updateLoanStatusByForm,
    initialStatusState
  );

  const handleSubmit = async (formData: FormData) => {
    formData.append('id', loanId.toString());
    formData.append('status', selectedStatus);
    
    try {
      await updateAction(formData);
      showSuccess("อัพเดตสถานะการยืมสำเร็จ");
      onClose();
    } catch (error) {
      showError("เกิดข้อผิดพลาดในการอัพเดตสถานะ");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            อัพเดตสถานะการยืม
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">การยืม #{loanId}</p>
            <p className="text-sm text-gray-600">ผู้ยืม: {borrowerName}</p>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานะปัจจุบัน
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  statusOptions.find(opt => opt.value === currentStatus)?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {statusOptions.find(opt => opt.value === currentStatus)?.label || currentStatus}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานะใหม่
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isUpdating}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isUpdating}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isUpdating || selectedStatus === currentStatus}
              >
                <Save size={16} />
                <span>{isUpdating ? "กำลังอัพเดต..." : "อัพเดตสถานะ"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
