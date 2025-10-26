"use client";

import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Category = { id: number; name: string };

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  createAction: (fd: FormData) => void;
}

export default function CreateModal({ open, onClose, categories, createAction }: CreateModalProps) {
  const { t } = useLanguage();
  
  const [serialized, setSerialized] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState<string>("");
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [wMode, setWMode] = useState<"none" | "months" | "until">("none");
  const [wMonths, setWMonths] = useState<string>("");
  const [wUntil, setWUntil] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const end = useMemo(
    () => calcWarrantyEnd(purchaseDate, wMode, wMonths, wUntil),
    [purchaseDate, wMode, wMonths, wUntil]
  );

  const warrantyPreview = useMemo(() => {
    if (!end) return "—";
    const now = dayjs();
    const isPast = end.isBefore(now, "day");
    const { years, months, days } = isPast ? diffAsParts(end, now) : diffAsParts(now, end);
    const label = formatPartsTH(years, months, days);
    return isPast
      ? `หมดประกันมาแล้ว ${label} (หมดเมื่อ ${end.format("YYYY-MM-DD")})`
      : `เหลืออีก ${label} 
      (หมด ${end.format("YYYY-MM-DD")})`;
  }, [end]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100" aria-label="ปิด">
          <X size={20} className="text-gray-500" />
        </button>

        <div className="mb-4 text-lg font-semibold text-gray-900 pr-8">
          {t("สร้างทรัพย์สินใหม่")}
        </div>

        <form action={createAction} className="space-y-4" onSubmit={(e) => {
          const form = e.currentTarget;
          const sku = (form.elements.namedItem('sku') as HTMLInputElement)?.value?.trim();
          const name = (form.elements.namedItem('name') as HTMLInputElement)?.value?.trim();
          
          if (!sku || !name) {
            e.preventDefault();
            alert("กรุณากรอก SKU และชื่อให้ครบถ้วน");
            return false;
          }
          
          // Log form data before submission for debugging
          console.log("Form submission data:", {
            sku: (form.elements.namedItem('sku') as HTMLInputElement)?.value,
            name: (form.elements.namedItem('name') as HTMLInputElement)?.value,
            categoryId: (form.elements.namedItem('categoryId') as HTMLSelectElement)?.value,
            description: (form.elements.namedItem('description') as HTMLTextAreaElement)?.value,
            isSerialized: (form.elements.namedItem('isSerialized') as HTMLInputElement)?.checked,
            totalQty: (form.elements.namedItem('totalQty') as HTMLInputElement)?.value,
            purchaseDate: (form.elements.namedItem('purchaseDate') as HTMLInputElement)?.value,
            purchasePrice: (form.elements.namedItem('purchasePrice') as HTMLInputElement)?.value,
            warrantyMode: (form.elements.namedItem('warrantyMode') as HTMLSelectElement)?.value,
            warrantyMonths: (form.elements.namedItem('warrantyMonths') as HTMLInputElement)?.value,
            warrantyUntil: (form.elements.namedItem('warrantyUntil') as HTMLInputElement)?.value,
            snBulk: (form.elements.namedItem('snBulk') as HTMLTextAreaElement)?.value
          });
        }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">SKU</span>
              <input 
                name="sku" 
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
            </label>
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">{t("ชื่อ")}</span>
              <input 
                name="name" 
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">{t("หมวดหมู่")}</span>
              <select 
                name="categoryId" 
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">{t("รูปภาพ")}</span>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={handleImageChange}
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-2 h-24 w-24 rounded-lg object-cover border border-gray-300"
                />
              )}
            </label>
          </div>

          <label className="flex items-center gap-2 text-black px-3 py-2 rounded-lg">
            <input 
              type="checkbox" 
              name="isSerialized" 
              onChange={(e) => setSerialized(e.currentTarget.checked)} 
            />
            <span>{t("Serialized with Serial Numbers (SN)")}</span>
          </label>

          {!serialized && (
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">{t("จำนวนรวม")}</span>
              <input 
                type="number" 
                min={0} 
                defaultValue={0} 
                name="totalQty" 
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </label>
          )}

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">{t("คำอธิบาย")}</span>
            <textarea 
              name="description" 
              rows={3} 
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
            />
          </label>

          {/* ซื้อ/ราคา/ประกัน */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">{t("วันที่ซื้อ")}</span>
              <input
                type="date"
                name="purchaseDate"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">{t("ราคาซื้อ")}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="purchasePrice"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">{t("ประกัน")}</span>
              <select
                value={wMode}
                onChange={(e) => setWMode(e.target.value as "none" | "months" | "until")}
                name="warrantyMode"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">{t("ไม่มี")}</option>
                <option value="months">{t("ตามเดือน")}</option>
                <option value="until">{t("จนถึงวันที่")}</option>
              </select>
            </label>
          </div>

          {wMode === "months" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="space-y-2 block">
                <span className="text-sm font-medium text-gray-700">{t("เดือนประกัน")}</span>
                <input
                  type="number"
                  min={1}
                  name="warrantyMonths"
                  value={wMonths}
                  onChange={(e) => setWMonths(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </label>
              <div className="sm:col-span-2 flex items-end">
                <div className="text-sm text-gray-500">
                  {purchaseDate ? t("จะคำนวณจากวันที่ซื้อ") : t("ไม่ได้ระบุวันที่ซื้อ — จะนับจากวันนี้")}
                </div>
              </div>
            </div>
          )}

          {wMode === "until" && (
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">{t("ประกันจนถึง")}</span>
              <input
                type="date"
                name="warrantyUntil"
                value={wUntil}
                onChange={(e) => setWUntil(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
          )}

          {wMode !== "none" && (
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm">
              {t("พรีวิวประกัน")}: <b>{warrantyPreview}</b>
            </div>
          )}

          {/* SN bulk */}
          {serialized && (
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">{t("Serial Number เริ่มต้น (หนึ่งบรรทัดต่อหนึ่ง SN)")}</span>
              <textarea 
                name="snBulk" 
                rows={5} 
                placeholder="SN001\nSN002\nSN003" 
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
              />
            </label>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              {t("ปิด")}
            </button>
            <button 
              type="submit" 
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {t("บันทึก")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Warranty helpers ---------- */
function calcWarrantyEnd(
  purchaseDateStr?: string,
  mode?: "none" | "months" | "until",
  warrantyMonthsStr?: string,
  warrantyUntilStr?: string
): dayjs.Dayjs | null {
  if (mode === "until" && warrantyUntilStr) {
    const d = dayjs(warrantyUntilStr);
    return d.isValid() ? d.endOf("day") : null;
  }
  if (mode === "months" && warrantyMonthsStr) {
    const months = Number(warrantyMonthsStr);
    if (!Number.isFinite(months) || months <= 0) return null;
    const base = purchaseDateStr && dayjs(purchaseDateStr).isValid()
      ? dayjs(purchaseDateStr)
      : dayjs();
    return base.add(months, "month").endOf("day");
  }
  return null;
}

function diffAsParts(from: dayjs.Dayjs, to: dayjs.Dayjs) {
  let monthsTotal = to.diff(from, "month");
  let anchor = from.add(monthsTotal, "month");
  if (anchor.isAfter(to)) {
    monthsTotal -= 1;
    anchor = from.add(monthsTotal, "month");
  }
  const days = to.diff(anchor, "day");
  const years = Math.floor(monthsTotal / 12);
  const months = monthsTotal % 12;
  return { years, months, days };
}

function formatPartsTH(years: number, months: number, days: number) {
  const segs: string[] = [];
  if (years) segs.push(`${years} ปี`);
  if (months) segs.push(`${months} เดือน`);
  if (days || segs.length === 0) segs.push(`${days} วัน`);
  return segs.join(" ");
}
