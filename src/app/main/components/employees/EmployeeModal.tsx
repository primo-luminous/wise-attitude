"use client";

import { useRef, useState, useMemo, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { X } from "lucide-react";
import { createEmployee, updateEmployee } from "@/app/actions/employees";

interface Employee {
  id: number;
  employeeID: string;
  titlePrefix: string | null;
  name: string;
  nickname: string | null;
  email: string;
  ppPhone: string | null;
  wPhone: string | null;
  birthday: string | null;
  status: "active" | "inactive" | "suspended";
  departmentId: number | null;
  positionId: number | null;
  imageUrl: string | null;

  address: string | null;
  dayOff: string | null;
  educationLevel: string | null;
  university: string | null;
  major: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  socialSecurityStart: string | null;

  createdAt: string;
  updatedAt: string;
}

type DepOpt = { id: number; nameEn?: string };
type PosOpt = { id: number; nameEn?: string; departmentId: number | null };

type ActionResult = { ok: boolean; error?: string; stamp: number };

export default function EmployeeModal({
  isOpen,
  onClose,
  employee,
  mode,
  departments,
  positions,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
  mode: "create" | "edit";
  departments: DepOpt[];
  positions: PosOpt[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const handledStampRef = useRef<number>(0);
  const router = useRouter();

  const [deptId, setDeptId] = useState<number | "">(employee?.departmentId ?? "");
  const [posId, setPosId] = useState<number | "">(employee?.positionId ?? "");

  useEffect(() => {
    if (!isOpen) return;
    setDeptId(employee?.departmentId ?? "");
    setPosId(employee?.positionId ?? "");
  }, [isOpen, employee?.departmentId, employee?.positionId]);

  // แสดงเฉพาะตำแหน่งที่ departmentId ตรงกับแผนกที่เลือก
  const filteredPositions = useMemo(() => {
    if (!deptId) return [];
    return positions.filter((p) => p.departmentId === Number(deptId));
  }, [positions, deptId]);

  // ถ้าแผนกเปลี่ยนและตำแหน่งที่เลือกอยู่ไม่สัมพันธ์ ให้ล้างค่า
  useEffect(() => {
    if (!isOpen) return;
    if (deptId === "") {
      if (posId !== "") setPosId("");
      return;
    }
    const stillValid = posId !== "" && filteredPositions.some((p) => p.id === Number(posId));
    if (!stillValid && posId !== "") setPosId("");
  }, [deptId, filteredPositions, isOpen, posId]);

  const submit = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
    try {
      const res = await (mode === "create" ? createEmployee(formData) : updateEmployee(formData));
      const ok = (res && "ok" in res ? (res as { ok: boolean }).ok : true);
      const error = (res as { error?: string })?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      return { ok: false, error: (e && typeof e === 'object' && 'message' in e ? (e as { message: string }).message : "เกิดข้อผิดพลาด"), stamp: Date.now() };
    }
  };

  const [state, formAction] = useActionState<ActionResult, FormData>(submit, { ok: false, stamp: 0 });

  useEffect(() => {
    if (!state.stamp) return;
    if (handledStampRef.current === state.stamp) return;
    handledStampRef.current = state.stamp;

    if (state.ok) {
      Swal.fire({
        icon: "success",
        title: mode === "create" ? "สร้างพนักงานสำเร็จ" : "บันทึกพนักงานสำเร็จ",
        timer: 3000,
        showConfirmButton: false,
      }).then(() => {
        onClose();
        router.refresh();
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: state.error || (mode === "create" ? "ไม่สามารถสร้างพนักงานได้" : "ไม่สามารถบันทึกพนักงานได้"),
        timer: 3000,
        showConfirmButton: false,
      });
    }
  }, [state, mode, onClose, router]);

  if (!isOpen) return null;

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 " +
    "selection:bg-blue-200 selection:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      {/* การ์ดแบบเลื่อน */}
      <div className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-xl relative overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header ติดบน */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-4 border-b">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="ปิด"
          >
            <X size={20} className="text-gray-500" />
          </button>
          <div className="text-lg font-semibold text-gray-900 pr-10">
            {mode === "create" ? "สร้างพนักงานใหม่" : "แก้ไขพนักงาน"}
          </div>
        </div>

        {/* ฟอร์ม (ส่วนเลื่อน) */}
        <form
          ref={formRef}
          action={formAction}
          className="flex-1 min-h-0 overflow-y-auto px-6 py-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {mode === "edit" && <input type="hidden" name="id" value={employee?.id} />}

          {/* =================== ข้อมูลหลัก =================== */}
          <div className="sm:col-span-2 text-sm font-semibold text-gray-700">ข้อมูลหลัก</div>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">Employee No.</span>
            <input name="employeeID" defaultValue={employee?.employeeID ?? ""} className={inputCls} required />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">คำนำหน้า</span>
            <input name="titlePrefix" defaultValue={employee?.titlePrefix ?? ""} className={inputCls} />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล</span>
            <input name="name" defaultValue={employee?.name ?? ""} className={inputCls} required />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">ชื่อเล่น</span>
            <input name="nickname" defaultValue={employee?.nickname ?? ""} className={inputCls} />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input type="email" name="email" defaultValue={employee?.email ?? ""} className={inputCls} required />
          </label>

          <label className="space-y-1 block sm:col-span-2">
            <span className="text-sm font-medium text-gray-700">รูปโปรไฟล์</span>
            <input 
              type="file" 
              name="image" 
              accept="image/*" 
              className={`${inputCls} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
            />
            {employee?.imageUrl && (
              <div className="mt-2">
                <img 
                  src={employee.imageUrl} 
                  alt="Current profile" 
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-1">รูปปัจจุบัน</p>
              </div>
            )}
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">วันเกิด</span>
            <input
              type="date"
              name="birthday"
              defaultValue={(employee?.birthday ?? "").slice(0, 10)}
              className={inputCls}
            />
          </label>

          {/* =================== การติดต่อ =================== */}
          <div className="sm:col-span-2 text-sm font-semibold text-gray-700 pt-2">การติดต่อ</div>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">เบอร์ส่วนตัว</span>
            <input name="ppPhone" defaultValue={employee?.ppPhone ?? ""} className={inputCls} />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">เบอร์ที่ทำงาน</span>
            <input name="wPhone" defaultValue={employee?.wPhone ?? ""} className={inputCls} />
          </label>

          <label className="space-y-1 block sm:col-span-2">
            <span className="text-sm font-medium text-gray-700">ที่อยู่</span>
            <textarea name="address" rows={3} defaultValue={employee?.address ?? ""} className={`${inputCls} resize-none`} />
          </label>

          {/* =================== งาน/แผนก =================== */}
          <div className="sm:col-span-2 text-sm font-semibold text-gray-700 pt-2">งานและหน่วยงาน</div>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">สถานะ</span>
            <select name="status" defaultValue={employee?.status ?? "active"} className={inputCls}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
            </select>
          </label>

          {/* ▼▼ ใช้ nameEn สำหรับ Department ▼▼ */}
          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">แผนก (Department)</span>
            <select
              name="departmentId"
              value={deptId === "" ? "" : Number(deptId)}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : "";
                setDeptId(v);
                setPosId(""); // รีเซ็ตตำแหน่งเมื่อเปลี่ยนแผนก
              }}
              className={inputCls}
            >
              <option value="">— เลือกแผนก —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameEn || `Dept #${d.id}`}
                </option>
              ))}
            </select>
          </label>

          {/* ▼▼ ใช้ nameEn สำหรับ Position + ฟิลเตอร์ตาม Department ▼▼ */}
          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">ตำแหน่ง (Position)</span>
            <select
              name="positionId"
              value={posId === "" ? "" : Number(posId)}
              onChange={(e) => setPosId(e.target.value ? Number(e.target.value) : "")}
              disabled={deptId === ""} // ต้องเลือกแผนกก่อน
              className={`${inputCls} ${deptId === "" ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
            >
              <option value="">{deptId === "" ? "— เลือกแผนกก่อน —" : "— เลือกตำแหน่ง —"}</option>
              {filteredPositions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameEn || `Position #${p.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">วันหยุด (เช่น Sat-Sun)</span>
            <input name="dayOff" defaultValue={employee?.dayOff ?? ""} className={inputCls} />
          </label>

          {/* =================== การศึกษา =================== */}
          <div className="sm:col-span-2 text-sm font-semibold text-gray-700 pt-2">การศึกษา</div>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">ระดับการศึกษา</span>
            <input name="educationLevel" defaultValue={employee?.educationLevel ?? ""} className={inputCls} />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">มหาวิทยาลัย</span>
            <input name="university" defaultValue={employee?.university ?? ""} className={inputCls} />
          </label>

          <label className="space-y-1 block sm:col-span-2">
            <span className="text-sm font-medium text-gray-700">สาขาวิชา</span>
            <input name="major" defaultValue={employee?.major ?? ""} className={inputCls} />
          </label>

          {/* =================== การเงิน/ธนาคาร =================== */}
          <div className="sm:col-span-2 text-sm font-semibold text-gray-700 pt-2">การเงิน/ธนาคาร</div>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">ธนาคาร</span>
            <input name="bankName" defaultValue={employee?.bankName ?? ""} className={inputCls} />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">เลขที่บัญชีธนาคาร</span>
            <input name="bankAccountNumber" defaultValue={employee?.bankAccountNumber ?? ""} className={inputCls} />
          </label>

          {/* =================== ประกันสังคม =================== */}
          <div className="sm:col-span-2 text-sm font-semibold text-gray-700 pt-2">ประกันสังคม</div>

          <label className="space-y-1 block">
            <span className="text-sm font-medium text-gray-700">วันเริ่มประกันสังคม</span>
            <input
              type="date"
              name="socialSecurityStart"
              defaultValue={(employee?.socialSecurityStart ?? "").slice(0, 10)}
              className={inputCls}
            />
          </label>

          {/* Footer ติดล่าง */}
          <div className="sm:col-span-2 sticky bottom-0 -mx-6 px-6 py-4 bg-white/95 backdrop-blur border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
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
