"use client";

import React, { useEffect, useState } from "react";
import { useActionState } from "react";
import { X } from "lucide-react";
import { updateLoanItemByForm } from "../../../actions/loans";
import { showToast } from "@/lib/sweetalert";

type EditLoanItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  loanItemData: {
    id: number;
    assetId: number;
    assetName: string;
    assetSku: string;
    isSerialized: boolean;
    quantity: number;
    serialNumber?: string | null;
    startAt?: string | null;
    dueAt?: string | null;
    returnedAt?: string | null;
    note?: string | null;
  };
  assets: Array<{
    id: number;
    sku: string;
    name: string;
    isSerialized: boolean;
    availableQty: number;
    availableUnits: Array<{
      id: number;
      serialNumber: string;
      status: string;
    }>;
  }>;
  loanStatus: "OPEN" | "USE" | "CLOSED" | "CANCELLED" | "OVERDUE";
  onSuccess: () => void;
};

export default function EditLoanItemModal({
  isOpen,
  onClose,
  loanItemData,
  assets,
  loanStatus,
  onSuccess
}: EditLoanItemModalProps) {
  const [state, formAction] = useActionState(updateLoanItemByForm, { ok: false, error: null });
  const [selectedAssetId, setSelectedAssetId] = useState<number>(loanItemData.assetId);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(loanItemData.quantity);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(
    loanItemData.isSerialized ? loanItemData.id : null
  );
  const [note, setNote] = useState<string>(loanItemData.note || "");
  const [startAt, setStartAt] = useState<string>("");
  const [dueAt, setDueAt] = useState<string>("");
  const [returnedAt, setReturnedAt] = useState<string>("");
  const [errors, setErrors] = useState<{ startAt?: string; dueAt?: string; returnedAt?: string }>({});

  // ฟิลเตอร์สินทรัพย์ที่มีสถานะ active และมีจำนวนพร้อมใช้งาน
  const availableAssets = assets.filter(asset =>
    asset.availableQty > 0 || asset.availableUnits.length > 0
  );

  // สินทรัพย์ที่เลือก
  const selectedAsset = availableAssets.find(asset => asset.id === selectedAssetId);

  // หน่วยสินทรัพย์ที่พร้อมใช้งาน
  const availableUnits = React.useMemo(() =>
    selectedAsset?.availableUnits || [],
    [selectedAsset?.availableUnits]
  );

  // Validation function
  const validateForm = () => {
    const newErrors: { startAt?: string; dueAt?: string; returnedAt?: string } = {};
    
    // วันที่ยืมต้อง required เสมอ
    if (!startAt.trim()) {
      newErrors.startAt = "กรุณาเลือกวันที่ยืม";
    }
    
    // วันที่กำหนดต้อง required เมื่อปิดการยืม
    if (loanStatus === "CLOSED" && !dueAt.trim()) {
      newErrors.dueAt = "กรุณาเลือกวันที่กำหนดเมื่อปิดการยืม";
    }
    
    // ตรวจสอบ returnedAt
    if (returnedAt.trim()) {
      const returnedDate = new Date(returnedAt);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // ตรวจสอบว่าวันที่คืนต้องไม่เกินสิ้นเดือนปัจจุบัน
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
      
      if (returnedDate > lastDayOfMonth) {
        newErrors.returnedAt = `วันที่คืนต้องไม่เกินสิ้นเดือนปัจจุบัน (${lastDayOfMonth.getDate()}/${currentMonth + 1}/${currentYear})`;
      }
      
      // ตรวจสอบว่าวันที่คืนต้องไม่เกินวันที่กำหนด (ถ้ามี)
      if (dueAt.trim()) {
        const dueDate = new Date(dueAt);
        if (returnedDate > dueDate) {
          newErrors.returnedAt = "วันที่คืนต้องไม่เกินวันที่กำหนด";
        }
      }
      
      // ตรวจสอบว่าวันที่คืนต้องไม่ก่อนวันที่ยืม
      if (startAt.trim()) {
        const startDate = new Date(startAt);
        if (returnedDate < startDate) {
          newErrors.returnedAt = "วันที่คืนต้องไม่ก่อนวันที่ยืม";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (state.ok) {
      showToast("แก้ไขรายการสินทรัพย์สำเร็จ", "success");
      onSuccess();
      onClose();
    } else if (state.error) {
      showToast(state.error, "error");
    }
  }, [state, onSuccess, onClose]);

  // รีเซ็ตค่าเมื่อเปิด modal
  useEffect(() => {
    if (isOpen) {
      setSelectedAssetId(loanItemData.assetId);
      setSelectedQuantity(loanItemData.quantity);
      setSelectedUnitId(loanItemData.isSerialized ? loanItemData.id : null);
      setNote(loanItemData.note || "");
      setStartAt(loanItemData.startAt || "");
      setDueAt(loanItemData.dueAt || "");
      setReturnedAt(loanItemData.returnedAt || "");
    }
  }, [isOpen, loanItemData]);

  // รีเซ็ตค่าเมื่อเปลี่ยนสินทรัพย์
  useEffect(() => {
    if (selectedAsset) {
      if (selectedAsset.isSerialized) {
        setSelectedQuantity(1);
        setSelectedUnitId(availableUnits.length > 0 ? availableUnits[0].id : null);
      } else {
        setSelectedUnitId(null);
        setSelectedQuantity(1);
      }
    }
  }, [selectedAsset, availableUnits]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const formData = new FormData();
      formData.append("loanItemId", loanItemData.id.toString());
      formData.append("assetId", selectedAssetId.toString());
      formData.append("quantity", selectedQuantity.toString());
      formData.append("assetUnitId", selectedUnitId?.toString() || "");
      formData.append("startAt", startAt);
      formData.append("dueAt", dueAt);
      formData.append("returnedAt", returnedAt);
      formData.append("note", note);
      
      updateLoanItemByForm({ ok: false, error: null }, formData);
    }
  };

  if (!isOpen || !loanItemData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl p-6 relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100" aria-label="ปิด">
          <X size={20} className="text-gray-500" />
        </button>

        <div className="mb-4 text-lg font-semibold text-gray-900 pr-8">
          แก้ไขรายการสินทรัพย์
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>รายการเดิม:</strong> {loanItemData.assetSku} - {loanItemData.assetName}
          </p>
          <p className="text-sm text-gray-600">
            <strong>จำนวน:</strong> {loanItemData.isSerialized ? loanItemData.serialNumber : loanItemData.quantity}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="loanItemId" value={loanItemData.id} />

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">สินทรัพย์ใหม่:</span>
            <select
              id="assetId"
              name="assetId"
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.sku} - {asset.name}
                  {asset.isSerialized
                    ? ` (${asset.availableUnits.length} หน่วย)`
                    : ` (${asset.availableQty} ชิ้น)`
                  }
                </option>
              ))}
            </select>
          </label>

          {selectedAsset && (
            <>
              {selectedAsset.isSerialized ? (
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-gray-700">Serial Number:</span>
                  <select
                    id="assetUnitId"
                    name="assetUnitId"
                    value={selectedUnitId || ""}
                    onChange={(e) => setSelectedUnitId(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">เลือก Serial Number</option>
                    {availableUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.serialNumber}
                      </option>
                    ))}
                  </select>
                  <input type="hidden" name="quantity" value="1" />
                </label>
              ) : (
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-gray-700">จำนวน:</span>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max={selectedAsset.availableQty}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">
                    จำนวนที่มี: {selectedAsset.availableQty} ชิ้น
                  </p>
                  <input type="hidden" name="assetUnitId" value="" />
                </label>
              )}
            </>
          )}

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">
              วันที่ยืม <span className="text-red-500">*</span>:
            </span>
            <input
              type="date"
              name="startAt"
              value={startAt}
              onChange={(e) => {
                setStartAt(e.target.value);
                if (errors.startAt) {
                  setErrors(prev => ({ ...prev, startAt: undefined }));
                }
              }}
              className={`w-full rounded-lg border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.startAt ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.startAt && (
              <p className="text-sm text-red-500">{errors.startAt}</p>
            )}
          </label>
          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">
              วันที่กำหนด{loanStatus === "CLOSED" && <span className="text-red-500"> *</span>}:
            </span>
            <input
              type="date"
              name="dueAt"
              value={dueAt}
              onChange={(e) => {
                setDueAt(e.target.value);
                if (errors.dueAt) {
                  setErrors(prev => ({ ...prev, dueAt: undefined }));
                }
              }}
              className={`w-full rounded-lg border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.dueAt ? 'border-red-500' : 'border-gray-300'
              }`}
              required={loanStatus === "CLOSED"}
            />
            {errors.dueAt && (
              <p className="text-sm text-red-500">{errors.dueAt}</p>
            )}
            {loanStatus === "CLOSED" && (
              <p className="text-xs text-gray-500">ต้องระบุวันที่กำหนดเมื่อปิดการยืม</p>
            )}
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">วันที่คืนจริง:</span>
            <input
              type="date"
              name="returnedAt"
              value={returnedAt}
              onChange={(e) => {
                setReturnedAt(e.target.value);
                if (errors.returnedAt) {
                  setErrors(prev => ({ ...prev, returnedAt: undefined }));
                }
              }}
              className={`w-full rounded-lg border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.returnedAt ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.returnedAt && (
              <p className="text-sm text-red-500">{errors.returnedAt}</p>
            )}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ ข้อควรระวัง:</strong> หากกำหนดวันคืนภายในเดือนปัจจุบัน จะต้องคืนภายในสิ้นเดือนนี้
              </p>
            </div>
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">หมายเหตุ:</span>
            <textarea
              id="note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="กรอกหมายเหตุ (ไม่บังคับ)"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </label>

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
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
