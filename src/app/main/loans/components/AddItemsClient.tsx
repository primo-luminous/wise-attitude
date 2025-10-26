// src/app/main/loans/components/AddItemsClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { addLoanItemByForm } from "@/actions/loans"; // ✅ ใช้เวอร์ชัน 1 พารามิเตอร์

type AssetUnit = {
  id: number;
  serialNumber: string;
  status: string;
};

type Asset = {
  id: number;
  sku: string;
  name: string;
  isSerialized: boolean;
  totalQty: number;
  availableQty: number;
  availableUnits: AssetUnit[];
  category?: { id: number; name: string } | null;
};

type AssetCategory = { id: number; name: string };

export default function AddItemsClient({
  loanId,
  assets,
  categories,
}: {
  loanId: number;
  assets: Asset[];
  categories: AssetCategory[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [assetPick, setAssetPick] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);

  const filteredAssets = useMemo(() => {
    if (!selectedCategory) return assets;
    return assets.filter((asset) => asset.category?.id === selectedCategory);
  }, [assets, selectedCategory]);

  const availableAssets = useMemo(() => {
    return filteredAssets.filter((asset) =>
      asset.isSerialized ? asset.availableUnits.length > 0 : asset.availableQty > 0
    );
  }, [filteredAssets]);

  const assetMap = useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);
  const picked = assetPick ? assetMap.get(assetPick) ?? null : null;

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setAssetPick(null);
    setSelectedUnit(null);
  };

  const handleAssetChange = (assetId: number | null) => {
    setAssetPick(assetId);
    setSelectedUnit(null);
    setQty(1);
  };

  // ไม่ใช่ SN
  const handleAddQty = async (formData: FormData) => {
    if (!picked) {
      await Swal.fire({ icon: "error", title: "กรุณาเลือกทรัพย์สิน" });
      return;
    }

    setIsLoading(true);
    try {
      formData.set("loanId", String(loanId));
      formData.set("assetId", String(picked.id));
      formData.set("quantity", String(qty));

      const res = await addLoanItemByForm(formData); // ✅ เรียกเวอร์ชัน 1 พารามิเตอร์
      if (!res?.ok) throw new Error(res?.error || "เพิ่มรายการล้มเหลว");

      await Swal.fire({ icon: "success", title: "เพิ่มรายการสำเร็จ", timer: 800, showConfirmButton: false });
      router.refresh();

      setAssetPick(null);
      setSelectedUnit(null);
      setQty(1);
    } catch (err: unknown) {
      await Swal.fire({ icon: "error", title: "เพิ่มรายการล้มเหลว", text: (err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : "เกิดข้อผิดพลาด") });
    } finally {
      setIsLoading(false);
    }
  };

  // เป็น SN
  const handleAddUnit = async (formData: FormData) => {
    if (!picked) {
      await Swal.fire({ icon: "error", title: "กรุณาเลือกทรัพย์สิน" });
      return;
    }
    if (picked.isSerialized && !selectedUnit) {
      await Swal.fire({ icon: "error", title: "กรุณาเลือก Serial Number" });
      return;
    }

    setIsLoading(true);
    try {
      formData.set("loanId", String(loanId));
      formData.set("assetId", String(picked.id));
      if (selectedUnit) formData.set("assetUnitId", String(selectedUnit));

      const res = await addLoanItemByForm(formData); // ✅ เรียกเวอร์ชัน 1 พารามิเตอร์
      if (!res?.ok) throw new Error(res?.error || "เพิ่มรายการล้มเหลว");

      await Swal.fire({ icon: "success", title: "เพิ่มรายการสำเร็จ", timer: 800, showConfirmButton: false });
      router.refresh();

      setAssetPick(null);
      setSelectedUnit(null);
      setQty(1);
    } catch (err: unknown) {
      await Swal.fire({ icon: "error", title: "เพิ่มรายการล้มเหลว", text: (err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : "เกิดข้อผิดพลาด") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
      <div className="mb-4 text-lg font-semibold text-gray-900">เพิ่มรายการ</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* เลือกหมวดหมู่ */}
        <label className="space-y-2 block">
          <span className="text-sm font-medium text-gray-700">หมวดหมู่</span>
          <select
            value={selectedCategory ?? ""}
            onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">- เลือกหมวดหมู่ -</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {/* เลือกทรัพย์สิน */}
        <label className="space-y-2 block">
          <span className="text-sm font-medium text-gray-700">ทรัพย์สิน</span>
          <select
            value={assetPick ?? ""}
            onChange={(e) => handleAssetChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || !selectedCategory}
          >
            <option value="">
              {!selectedCategory ? "- เลือกหมวดหมู่ก่อน -" : "- เลือกทรัพย์สิน -"}
            </option>
            {availableAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.sku} — {asset.name} {asset.isSerialized ? `(SN: ${asset.availableUnits.length})` : `(Qty: ${asset.availableQty})`}
              </option>
            ))}
          </select>
          {selectedCategory && availableAssets.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">ไม่มีทรัพย์สินในหมวดหมู่นี้ หรือไม่มี stock</p>
          )}
        </label>
      </div>

      {/* เลือก Serial Number สำหรับทรัพย์สินที่เป็น SN */}
      {picked && picked.isSerialized && picked.availableUnits.length > 0 && (
        <div className="mt-4">
          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">เลือก Serial Number</span>
            <select
              value={selectedUnit ?? ""}
              onChange={(e) => setSelectedUnit(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">- เลือก Serial Number -</option>
              {picked.availableUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.serialNumber}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* รายละเอียดทรัพย์สิน */}
      {picked && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">รายละเอียดทรัพย์สิน</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">SKU:</span>
              <span className="ml-2 font-medium">{picked.sku}</span>
            </div>
            <div>
              <span className="text-gray-600">ชื่อ:</span>
              <span className="ml-2 font-medium">{picked.name}</span>
            </div>
            <div>
              <span className="text-gray-600">หมวดหมู่:</span>
              <span className="ml-2 font-medium">{picked.category?.name || "ไม่ระบุ"}</span>
            </div>
            <div>
              <span className="text-gray-600">ประเภท:</span>
              <span className="ml-2 font-medium">{picked.isSerialized ? "Serial Number" : "จำนวน"}</span>
            </div>
            {!picked.isSerialized && (
              <div>
                <span className="text-gray-600">Stock ที่เหลือ:</span>
                <span className="ml-2 font-medium text-blue-600">{picked.availableQty}</span>
              </div>
            )}
            {picked.isSerialized && (
              <div>
                <span className="text-gray-600">Serial Number ที่ใช้ได้:</span>
                <span className="ml-2 font-medium text-blue-600">{picked.availableUnits.length}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ฟอร์มเพิ่มรายการ */}
      <div className="mt-4">
        {/* แบบไม่ใช่ SN */}
        {picked && !picked.isSerialized && (
          <form action={handleAddQty} className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">จำนวน:</span>
              <input
                type="number"
                min={1}
                max={picked.availableQty}
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Math.min(Number(e.target.value || 1), picked.availableQty)))
                }
                name="quantity"
                className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="จำนวน"
                disabled={isLoading}
              />
            </label>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "กำลังเพิ่ม..." : "เพิ่มจำนวน"}
            </button>
          </form>
        )}

        {/* แบบ SN */}
        {picked && picked.isSerialized && (
          <form action={handleAddUnit} className="flex items-center gap-2">
            <input type="hidden" name="assetUnitId" value={selectedUnit || ""} />
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isLoading || !selectedUnit}
            >
              {isLoading ? "กำลังเพิ่ม..." : "เพิ่ม Serial Number"}
            </button>
          </form>
        )}

        {picked && picked.isSerialized && picked.availableUnits.length === 0 && (
          <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <strong>ทรัพย์สินนี้ใช้ Serial Number</strong>
            <br />
            แต่ไม่มี Serial Number ที่สามารถยืมได้ (อาจถูกยืมไปแล้ว)
          </div>
        )}
      </div>
    </div>
  );
}
