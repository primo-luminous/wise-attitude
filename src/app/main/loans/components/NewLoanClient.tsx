// src/app/main/loans/components/NewLoanClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import Link from "next/link";
import { createLoanByForm } from "@/actions/loans";
import { Skeleton, SkeletonCard } from "../../../../components/ui/Skeleton";

type Employee = { id: number; name: string; employeeID: string };
type AssetUnit = { id: number; serialNumber: string; status: string };
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
type LoanItem = {
  id: number;
  assetId: number;
  asset: { id: number; name: string; sku: string; isSerialized: boolean };
  quantity: number;
  assetUnit?: { id: number; serialNumber: string } | null;
  startAt?: string;
  dueAt?: string | null;
};

type CreateLoanState = { ok: boolean; loanId: number | null; error: string | null };
const initialCreateState: CreateLoanState = { ok: false, loanId: null, error: null };

export default function NewLoanClient({
  employees,
  assets,
}: {
  employees: Employee[];
  assets: Asset[];
}) {
  const [isLoading, setIsLoading] = useState(true);

  const [createState, createFormAction, createPending] = useActionState(
    createLoanByForm,
    initialCreateState
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!createState) return;
    if (createState.ok && createState.loanId) {
      Swal.fire({
        icon: "success",
        title: "เปิดใบยืมสำเร็จ",
        timer: 900,
        showConfirmButton: false,
      });
      window.location.href = `/main/loans/${createState.loanId}`;
    } else if (createState.error) {
      Swal.fire({
        icon: "error",
        title: "เปิดใบยืมล้มเหลว",
        text: createState.error,
      });
    }
  }, [createState]);

  // ====== (ส่วนเพิ่มรายการต่อในหน้านี้ ถ้าต้องการ) ======
  const [loanId, setLoanId] = useState<number | null>(null);
  const [items, setItems] = useState<LoanItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [assetPick, setAssetPick] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);

  const assetMap = useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);
  const picked = assetPick ? assetMap.get(assetPick) ?? null : null;

  const categories = useMemo(() => {
    const map = new Map<number, AssetCategory>();
    assets.forEach((a) => {
      if (a.category) map.set(a.category.id, a.category);
    });
    return Array.from(map.values());
  }, [assets]);

  const filteredAssets = useMemo(() => {
    if (!selectedCategory) return assets;
    return assets.filter((a) => a.category?.id === selectedCategory);
  }, [assets, selectedCategory]);

  const availableAssets = useMemo(() => {
    return filteredAssets.filter((a) =>
      a.isSerialized ? a.availableUnits.length > 0 : a.availableQty > 0
    );
  }, [filteredAssets]);

  const handleCategoryChange = (id: number | null) => {
    setSelectedCategory(id);
    setAssetPick(null);
    setSelectedUnit(null);
  };
  const handleAssetChange = (id: number | null) => {
    setAssetPick(id);
    setSelectedUnit(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-gray-900">
        <div className="space-y-2">
          <Skeleton height="32px" className="w-48" />
          <Skeleton height="16px" className="w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-gray-900">
      <h1 className="text-xl font-semibold">สร้างการยืมใหม่</h1>

      {/* ขั้นตอนที่ 1: สร้างใบยืม */}
      {!loanId && (
        <div className="rounded-2xl border border-gray-200 shadow-lg p-6">
          <div className="mb-4 text-lg font-semibold">ข้อมูลการยืม</div>
          <form action={createFormAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">ผู้ยืม</span>
              <select
                name="borrowerId"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
                disabled={createPending}
              >
                <option value="">- เลือกพนักงาน -</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.employeeID} — {e.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">กำหนดคืน (ถ้ามี)</span>
              <input
                type="date"
                name="dueDate"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                disabled={createPending}
              />
            </label>

            <label className="space-y-2 block sm:col-span-2">
              <span className="text-sm font-medium text-gray-700">หมายเหตุ</span>
              <input
                name="note"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                disabled={createPending}
              />
            </label>

            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="submit"
                className="btn-create whitespace-nowrap"
                disabled={createPending}
              >
                {createPending ? "กำลังสร้าง..." : "สร้างการยืม"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ขั้นตอนที่ 2: ส่วนเพิ่มรายการ (ใช้ต่อเมื่อไม่ redirect ออกไปหน้า [id]) */}
      {loanId && (
        <>
          <div className="rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="mb-4 text-lg font-semibold">เพิ่มรายการ</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2 block">
                <span className="text-sm font-medium text-gray-700">หมวดหมู่</span>
                <select
                  value={selectedCategory ?? ""}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">- เลือกหมวดหมู่ -</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-gray-700">ทรัพย์สิน</span>
                <select
                  value={assetPick ?? ""}
                  onChange={(e) => handleAssetChange(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  disabled={!selectedCategory}
                >
                  <option value="">
                    {!selectedCategory ? "- เลือกหมวดหมู่ก่อน -" : "- เลือกทรัพย์สิน -"}
                  </option>
                  {availableAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.sku} — {a.name}{" "}
                      {a.isSerialized ? `(SN: ${a.availableUnits.length})` : `(Qty: ${a.availableQty})`}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {picked && picked.isSerialized && picked.availableUnits.length > 0 && (
              <div className="mt-4">
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-gray-700">เลือก Serial Number</span>
                  <select
                    value={selectedUnit ?? ""}
                    onChange={(e) =>
                      setSelectedUnit(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">- เลือก Serial Number -</option>
                    {picked.availableUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.serialNumber}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {picked && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">รายละเอียดทรัพย์สิน</h4>
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
                    <span className="ml-2 font-medium">
                      {picked.category?.name || "ไม่ระบุ"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">ประเภท:</span>
                    <span className="ml-2 font-medium">
                      {picked.isSerialized ? "Serial Number" : "จำนวน"}
                    </span>
                  </div>
                  {!picked.isSerialized && (
                    <div>
                      <span className="text-gray-600">Stock ที่เหลือ:</span>
                      <span className="ml-2 font-medium">{picked.availableQty}</span>
                    </div>
                  )}
                  {picked.isSerialized && (
                    <div>
                      <span className="text-gray-600">Serial Number ที่ใช้ได้:</span>
                      <span className="ml-2 font-medium">
                        {picked.availableUnits.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200">
            <table className="min-w-[800px] w-full text-sm text-center">
              <thead className="bg-gray-50">
                <tr className="[&>th]:px-3 [&>th]:py-3">
                  <th className="w-16">ลำดับ</th>
                  <th className="w-48">SKU</th>
                  <th>ทรัพย์สิน</th>
                  <th className="w-32">โหมด</th>
                  <th className="w-40">จำนวน / SN</th>
                  <th className="w-48">วันที่ยืม</th>
                </tr>
              </thead>
              <tbody className="[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-gray-600">
                      ไม่มีรายการ
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => (
                    <tr key={it.id} className="[&>td]:px-3 [&>td]:py-3">
                      <td className="font-medium">{idx + 1}</td>
                      <td className="font-mono">{it.asset.sku}</td>
                      <td>{it.asset.name}</td>
                      <td>{it.asset.isSerialized ? "SN" : "จำนวน"}</td>
                      <td>{it.asset.isSerialized ? it.assetUnit?.serialNumber : it.quantity}</td>
                      <td className="text-gray-600">
                        {it.startAt ? dayjs(it.startAt).format("YYYY-MM-DD") : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
