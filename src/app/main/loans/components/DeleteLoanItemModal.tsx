"use client";

import React, { useEffect } from "react";
import { useActionState } from "react";
import { X, Trash2 } from "lucide-react";
import { deleteLoanItemByForm } from "../../../actions/loans";
import { showToast } from "@/lib/sweetalert";

type DeleteLoanItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  loanItemData: {
    id: number;
    assetName: string;
    assetSku: string;
    isSerialized: boolean;
    quantity: number;
    serialNumber?: string | null;
  };
  onSuccess: () => void;
};

export default function DeleteLoanItemModal({ 
  isOpen, 
  onClose, 
  loanItemData, 
  onSuccess 
}: DeleteLoanItemModalProps) {
  const [state, formAction] = useActionState(deleteLoanItemByForm, { ok: false, error: null });

  useEffect(() => {
    if (state.ok) {
      showToast("ลบรายการสินทรัพย์สำเร็จ", "success");
      onSuccess();
      onClose();
    } else if (state.error) {
      showToast(state.error, "error");
    }
  }, [state, onSuccess, onClose]);

  if (!isOpen || !loanItemData) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100" aria-label="ปิด">
          <X size={20} className="text-gray-500" />
        </button>

        <div className="mb-4 text-lg font-semibold text-gray-900 pr-8">
          ลบรายการสินทรัพย์
        </div>
        
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">คำเตือน</span>
          </div>
          <p className="text-sm text-red-700">
            คุณกำลังจะลบรายการสินทรัพย์นี้ การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">รายการที่จะลบ:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>SKU:</strong> {loanItemData.assetSku}</p>
            <p><strong>ชื่อ:</strong> {loanItemData.assetName}</p>
            <p><strong>ประเภท:</strong> {loanItemData.isSerialized ? "Serial Number" : "จำนวน"}</p>
            <p><strong>รายละเอียด:</strong> {loanItemData.isSerialized ? loanItemData.serialNumber : `${loanItemData.quantity} ชิ้น`}</p>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="loanItemId" value={loanItemData.id} />

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              ลบรายการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
