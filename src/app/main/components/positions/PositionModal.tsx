"use client";

import { useRef, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createPosition, updatePosition } from "@/app/actions/positions";
import { showToast } from "@/lib/sweetalert"; // ✅ ใช้ toast แทน Swal

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

interface Department { id: number; label: string; }

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: Position | null;
  departments: Department[];
  mode: "create" | "edit";
}

type ActionResult = { ok: boolean; error?: string; stamp: number };

export default function PositionModal({
  isOpen,
  onClose,
  position,
  departments,
  mode,
}: PositionModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const handledStampRef = useRef<number>(0); // กัน toast ยิงซ้ำ
  const router = useRouter();

  // ---- wrap server action เพื่ออ่านผลและแจ้ง toast
  const submit = async (_prev: ActionResult, fd: FormData): Promise<ActionResult> => {
    try {
      const res = await (mode === "create" ? createPosition(fd) : updatePosition(fd));
      const ok = (res && "ok" in res ? (res as { ok: boolean }).ok : true);
      const error = (res as { error?: string })?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      return { ok: false, error: (e && typeof e === 'object' && 'message' in e ? (e as { message: string }).message : "เกิดข้อผิดพลาด"), stamp: Date.now() };
    }
  };

  const [state, formAction] = useActionState<ActionResult, FormData>(submit, {
    ok: false,
    stamp: 0,
  });

  // แจ้งเตือนครั้งเดียวต่อผลลัพธ์
  useEffect(() => {
    if (!state.stamp || handledStampRef.current === state.stamp) return;
    handledStampRef.current = state.stamp;

    if (state.ok) {
      showToast(mode === "create" ? "สร้างตำแหน่งสำเร็จ" : "บันทึกตำแหน่งสำเร็จ", "success"); // ⏱ 3 วิ
      onClose();
      router.refresh();
    } else {
      showToast(state.error || (mode === "create" ? "ไม่สามารถสร้างตำแหน่งได้" : "ไม่สามารถบันทึกตำแหน่งได้"), "error");
      // ไม่ปิด modal เพื่อให้แก้ไขต่อได้
    }
  }, [state, mode, onClose, router]);

  // (ต้องอยู่หลัง Hooks ทั้งหมด)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="ปิด"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="mb-4 text-lg font-semibold text-gray-900 pr-8">
          {mode === "create" ? "สร้างตำแหน่งใหม่" : "แก้ไขตำแหน่ง"}
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          {mode === "edit" && <input type="hidden" name="id" value={position?.id ?? ""} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">แผนก</span>
              <select
                name="departmentId"
                defaultValue={position?.departmentId ?? ""}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                           text-gray-900 selection:bg-blue-200 selection:text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">เลือกแผนก</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-700">ระดับ</span>
              <input
                name="level"
                type="number"
                min={1}
                defaultValue={position?.level ?? 1}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                           text-gray-900 selection:bg-blue-200 selection:text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">ชื่อตำแหน่ง (ภาษาไทย)</span>
            <input
              name="nameTh"
              defaultValue={position?.nameTh ?? ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                         text-gray-900 selection:bg-blue-200 selection:text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="กรอกชื่อตำแหน่งภาษาไทย"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">ชื่อตำแหน่ง (ภาษาอังกฤษ)</span>
            <input
              name="nameEn"
              defaultValue={position?.nameEn ?? ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                         text-gray-900 selection:bg-blue-200 selection:text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="กรอกชื่อตำแหน่งภาษาอังกฤษ"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-gray-700">คำอธิบาย</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={position?.description ?? ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                         text-gray-900 selection:bg-blue-200 selection:text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="กรอกคำอธิบายตำแหน่ง (ไม่บังคับ)"
            />
          </label>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
            >
              {mode === "create" ? "สร้าง" : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
