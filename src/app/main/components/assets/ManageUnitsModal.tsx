"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Asset = {
  id: number;
  name: string;
  units?: Array<{
    id: number;
    serialNumber: string;
    status: "ACTIVE" | "INACTIVE" | "LOST" | "BROKEN";
    note: string | null;
    createdAt: string;
    updatedAt: string;
    borrower?: { id: number; employeeID: string; name: string } | null;
  }>;
};

interface ManageUnitsModalProps {
  asset: Asset;
  onClose: () => void;
  addUnitsAction: (fd: FormData) => void;
  updateUnitAction: (fd: FormData) => void;
  deleteUnitAction: (fd: FormData) => void;
}

export default function ManageUnitsModal({ 
  asset, 
  onClose, 
  addUnitsAction, 
  updateUnitAction, 
  deleteUnitAction 
}: ManageUnitsModalProps) {
  const { t } = useLanguage();
  
  const totalUnits = (asset.units ?? []).length;
  const availableUnits = (asset.units ?? []).filter(u => !u.borrower).length;



  function onBackdropMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.currentTarget === e.target) onClose();
  }

  /* ---------- Inline note editor ---------- */
  function InlineNote({
    unit,
    updateUnitAction,
  }: {
    unit: NonNullable<Asset["units"]>[number];
    updateUnitAction: (fd: FormData) => void;
  }) {
    const [val, setVal] = React.useState(unit.note ?? "");
    return (
      <form action={updateUnitAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={unit.id} />
        <input type="hidden" name="status" value={unit.status} />
        <input
          name="note"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-black text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("หมายเหตุ...")}
        />
        <button 
          type="submit" 
          className="rounded-lg border border-gray-300 bg-white px-2 py-1 hover:bg-gray-50 text-black text-xs"
        >
          {t("บันทึก")}
        </button>
      </form>
    );
  }

  /* ---------- Delete button ---------- */
  function RowDelete({
    id,
    deleteAction,
    label = "Delete",
    confirmText = "Delete item?",
  }: {
    id: number;
    deleteAction: (fd: FormData) => void;
    label?: string;
    confirmText?: string;
  }) {
    const formRef = React.useRef<HTMLFormElement>(null);
    return (
      <form ref={formRef} action={deleteAction} className="inline">
        <input type="hidden" name="id" value={id} />
        <button
          type="button"
          onClick={async () => {
            const ok = await import("sweetalert2").then((m) =>
              m.default.fire({
                icon: "warning",
                title: confirmText,
                showCancelButton: true,
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
              })
            );
            if (ok.isConfirmed) formRef.current?.requestSubmit();
          }}
          className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 hover:bg-red-100 text-red-600 text-xs"
          title={label}
        >
          {label}
        </button>
      </form>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`จัดการ Serial Number — ${asset.name}`}
      onMouseDown={onBackdropMouseDown}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-xl p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-black">{t("จัดการ Serial Number")} — {asset.name}</div>
          <div className="text-sm text-black">{t("พร้อมใช้งาน")} {availableUnits}/{totalUnits}</div>
        </div>

        {/* Add bulk SN */}
        <div className="rounded-xl border border-gray-200 p-4 mb-4 bg-gray-50">
          <form action={addUnitsAction} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <input type="hidden" name="assetId" value={asset.id} />
            <label className="sm:col-span-2 space-y-2 block">
              <span className="text-sm font-medium text-black">{t("เพิ่ม Serial Number (หนึ่งบรรทัดต่อหนึ่ง SN)")}</span>
              <textarea
                name="sns"
                rows={4}
                placeholder="SN001\nSN002\nSN003"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </label>
            <div className="sm:col-span-1 flex items-end">
              <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                {t("เพิ่ม")}
              </button>
            </div>
          </form>
        </div>

        {/* List units */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-[860px] w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                <th className="w-20 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("ID")}</th>
                <th className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("Serial Number")}</th>
                <th className="w-48 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("ผู้ยืม")}</th>
                <th className="w-40 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("สถานะ")}</th>
                <th className="w-64 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("หมายเหตุ")}</th>
                <th className="w-40 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("การดำเนินการ")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(asset.units ?? []).map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2 font-mono">{u.serialNumber}</td>

                                     <td className="px-3 py-2">
                     {u.borrower ? (
                       <span title={`${u.borrower.employeeID} — ${u.borrower.name}`} className="text-black">
                         {u.borrower.employeeID} — {u.borrower.name}
                       </span>
                     ) : (
                       <span className="text-green-600 font-medium">{t("พร้อมใช้งาน")}</span>
                     )}
                   </td>

                  <td className="px-3 py-2">
                    <form action={updateUnitAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="note" value={u.note ?? ''} />
                                               <select 
                           name="status" 
                           defaultValue={u.status} 
                           className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-black text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                         >
                        <option>ACTIVE</option>
                        <option>INACTIVE</option>
                        <option>LOST</option>
                        <option>BROKEN</option>
                      </select>
                      <button 
                        type="submit" 
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 hover:bg-gray-50 text-black text-xs"
                      >
                        {t("บันทึก")}
                      </button>
                    </form>
                  </td>

                  <td className="px-3 py-2 max-w-[300px]">
                    <InlineNote unit={u} updateUnitAction={updateUnitAction} />
                  </td>

                  <td className="px-3 py-2 space-x-2">
                    <RowDelete
                      id={u.id}
                      label={t("ลบ SN")}
                      confirmText={t("ลบ Serial Number นี้?")}
                      deleteAction={deleteUnitAction}
                    />
                  </td>
                </tr>
              ))}
              {(asset.units ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-black">{t("ไม่มี Serial Number")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose} 
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-black hover:bg-gray-50"
          >
            {t("ปิด")}
          </button>
        </div>
      </div>
    </div>
  );
}

