"use client";

import { useRef, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/sweetalert";
import { X } from "lucide-react";
import { createAssetCategory, updateAssetCategory } from "@/app/actions/asset-categories";

type ActionResult = { ok: boolean; error?: string; stamp: number };

export default function CategoryModal({ isOpen, onClose, category, mode }: {
  isOpen: boolean;
  onClose: () => void;
  category?: { id: number; name: string; note: string | null } | null;
  mode: "create" | "edit";
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // wrap server action
  const submit = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
    try {
      const res = mode === "create" ? await createAssetCategory(formData) : await updateAssetCategory(formData);
      const ok = (res && "ok" in res ? (res as { ok: boolean }).ok : true) as boolean;
      const error = (res as { error?: string })?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      return { ok: false, error: (e && typeof e === 'object' && 'message' in e ? (e as { message: string }).message : "เกิดข้อผิดพลาด"), stamp: Date.now() };
    }
  };

  const [state, formAction] = useActionState<ActionResult, FormData>(submit, { ok: false, stamp: 0 });

  // กันยิงซ้ำใน dev/strict mode
  const handledStamp = useRef<number>(0);

  useEffect(() => {
    if (!state.stamp || state.stamp === handledStamp.current) return;
    handledStamp.current = state.stamp;

    if (state.ok) {
      showToast(mode === "create" ? "สร้างหมวดหมู่สำเร็จ" : "บันทึกหมวดหมู่สำเร็จ", "success");
      onClose();
      router.refresh();
    } else {
      showToast(state.error || (mode === "create" ? "ไม่สามารถสร้างหมวดหมู่ได้" : "ไม่สามารถบันทึกหมวดหมู่ได้"), "error");
      // ไม่ปิด modal เผื่อแก้ไขต่อ
    }
  }, [state, mode, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100" aria-label="ปิด">
          <X size={20} className="text-gray-500" />
        </button>

        <div className="mb-4 text-lg font-semibold text-gray-900 pr-8">
          {mode === "create" ? "สร้างหมวดหมู่ใหม่" : "แก้ไขหมวดหมู่"}
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          {mode === "edit" && <input type="hidden" name="id" value={category?.id} />}

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">ชื่อหมวดหมู่</span>
            <input
              name="name"
              defaultValue={category?.name ?? ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                         text-gray-900 selection:bg-blue-200 selection:text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="กรอกชื่อหมวดหมู่"
              required
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">หมายเหตุ</span>
            <textarea
              name="note"
              rows={3}
              defaultValue={category?.note ?? ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                         text-gray-900 selection:bg-blue-200 selection:text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="กรอกหมายเหตุ (ไม่บังคับ)"
            />
          </label>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50">
              ยกเลิก
            </button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              {mode === "create" ? "สร้าง" : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
