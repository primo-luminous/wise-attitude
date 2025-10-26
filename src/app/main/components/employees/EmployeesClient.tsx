"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createEmployee, updateEmployee, deleteEmployee, resetEmployeePassword } from "@/app/actions/employees";
import { showToast, showConfirm } from "@/lib/sweetalert";
import SearchBar from "@/app/main/components/common/SearchBar";
import Pagination from "@/app/main/components/common/Pagination";
import ExportButtons from "@/app/main/components/common/ExportButtons";
import EmployeeTable from "@/app/main/components/employees/EmployeeTable";
import EmployeeModal from "@/app/main/components/employees/EmployeeModal";

interface Employee {
  id: number;
  employeeID: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  imageUrl?: string;
}
type DepOpt = { id: number; nameEn?: string; nameTh?: string; label?: string };
type PosOpt = { id: number; nameEn?: string; nameTh?: string; label?: string; departmentId: number | null };

export default function EmployeesClient({
  data,
  departments,
  positions,
}: {
  data: Employee[];
  departments: DepOpt[];
  positions: PosOpt[];
}) {
  const router = useRouter();

  // ===== Search =====
  const [searchQuery, setSearchQuery] = useState("");
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.trim().toLowerCase();
    return data.filter((emp) => {
      const keys = [
        emp.employeeID,
        emp.name,
        emp.email,
        emp.department,
        emp.position,
      ].map((v) => (v ?? "").toLowerCase());
      return keys.some((k) => k.includes(q));
    });
  }, [data, searchQuery]);

  // ===== Pagination =====
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = useMemo(
    () => filteredData.slice(startIndex, endIndex),
    [filteredData, startIndex, endIndex]
  );
  useEffect(() => setCurrentPage(1), [searchQuery]);

  // ===== Modals =====
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // ===== Server action states =====
  const [createState, createAction] = useActionState(createEmployee as unknown as (state: { ok: boolean; error?: string; stamp: number }, formData: FormData) => Promise<{ ok: boolean; error?: string; stamp: number }>, { ok: false, stamp: 0 });
  const [updateState, updateAction] = useActionState(updateEmployee as unknown as (state: { ok: boolean; error?: string; stamp: number }, formData: FormData) => Promise<{ ok: boolean; error?: string; stamp: number }>, { ok: false, stamp: 0 });

  useEffect(() => {
    if (!createState.stamp) return;
    if (createState.ok) {
      showToast("สร้างพนักงานสำเร็จ", "success"); // toast 3 วิ
      setIsCreateModalOpen(false);
      createAction(new FormData()); // reset state
      router.refresh();
    } else if (createState.error) {
      showToast(createState.error, "error");
    }
  }, [createState, createAction, router]);

  useEffect(() => {
    if (!updateState.stamp) return;
    if (updateState.ok) {
      showToast("แก้ไขพนักงานสำเร็จ", "success"); // toast 3 วิ
      setEditingEmployee(null);
      updateAction(new FormData()); // reset state
      router.refresh();
    } else if (updateState.error) {
      showToast(updateState.error, "error");
    }
  }, [updateState, updateAction, router]);

  const handleEdit = (employee: Employee) => setEditingEmployee(employee);

  // ===== Reset Password =====
  const handleResetPassword = async (emp: Employee) => {
    const fd = new FormData();
    fd.append("id", String(emp.id));

    try {
      const res = await resetEmployeePassword(fd);
      if (res?.ok) {
        showToast(`รหัสผ่านของ ${emp.name} ถูกรีเซ็ตเป็นรหัสเริ่มต้นแล้ว`, "success");
      } else {
        showToast(res?.error ?? "ไม่สามารถรีเซ็ตรหัสผ่านได้", "error");
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน", "error");
    }
  };

  // ===== Delete =====
  const handleDelete = async (emp: Employee) => {
    const c = await showConfirm(
      "ยืนยันการลบ",
      `ต้องการลบพนักงาน ${emp.employeeID} - ${emp.name} ใช่ไหม?`,
      "ลบ",
      "ยกเลิก"
    );
    if (!c.isConfirmed) return;

    const fd = new FormData();
    fd.append("id", String(emp.id)); // พอแล้ว ถ้า server action ไม่ได้ใช้ intent

    try {
      const res = await deleteEmployee(fd);
      if (res?.ok) {
        showToast("ลบพนักงานสำเร็จ", "success"); // toast 3 วิ
        router.refresh();
      } else {
        showToast(res?.error ?? "ลบพนักงานไม่สำเร็จ", "error");
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการลบ", "error");
    }
  };

  // ===== Export columns =====
  const exportColumns = [
    { header: "No.", value: (_r: Employee, i: number) => i + 1 },
    { header: "Employee No.", value: (r: Employee) => r.employeeID },
    { header: "Name", value: (r: Employee) => r.name },
    { header: "Email", value: (r: Employee) => r.email },
    { header: "Department", value: (r: Employee) => r.department },
    { header: "Position", value: (r: Employee) => r.position },
    { header: "Status", value: (r: Employee) => r.status },
  ];

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold text-black">จัดการพนักงาน</h1>
        <div className="flex items-center gap-2 sm:ml-auto">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="ค้นหาพนักงาน..." />
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-create whitespace-nowrap">
            + สร้างพนักงานใหม่
          </button>
          <ExportButtons<Record<string, unknown>>
            data={filteredData as unknown as Record<string, unknown>[]}
            columns={exportColumns as unknown as { header: string; value: (row: Record<string, unknown>, index: number) => unknown }[]}
            filename="Employees"
            fileBase="Employees"
            pdf={{ orientation: "l", title: "Employees", tableWidth: "wrap" }}
            companyName="Wise Attitude"
            logoUrl="/assets/images/Logo.jpg"
          />
        </div>
      </div>

      {/* Table */}
      <EmployeeTable
        employees={currentData}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          const emp = currentData.find(e => e.id === id);
          if (emp) handleDelete(emp);
        }}
        onResetPassword={handleResetPassword}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
      />

      {/* Create Modal */}
      <EmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
        departments={departments}
        positions={positions}
      />

      {/* Edit Modal */}
      <EmployeeModal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee as unknown as { id: number; employeeID: string; titlePrefix: string | null; name: string; nickname: string | null; email: string; ppPhone: string | null; wPhone: string | null; birthday: string | null; status: "active" | "inactive" | "suspended"; departmentId: number | null; positionId: number | null; imageUrl: string | null; address: string | null; dayOff: string | null; educationLevel: string | null; university: string | null; major: string | null; bankName: string | null; bankAccountNumber: string | null; socialSecurityStart: string | null; createdAt: string; updatedAt: string }}
        mode="edit"
        departments={departments}
        positions={positions}
      />
    </div>
  );
}
