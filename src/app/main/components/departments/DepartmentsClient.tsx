"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { createDepartment, updateDepartment } from "@/app/actions/departments";
import { showToast } from "@/lib/sweetalert";
import SearchBar from "@/app/main/components/common/SearchBar";
import Pagination from "@/app/main/components/common/Pagination";
import DepartmentTable from "@/app/main/components/departments/DepartmentTable";
import DepartmentModal from "@/app/main/components/departments/DepartmentModal";
import ExportButtons from "@/app/main/components/common/ExportButtons";

interface Department {
  id: number;
  nameTh: string | null;
  nameEn: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DepartmentsClient({ data }: { data: Department[] }) {
  // ===== Search =====
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    
    const query = searchQuery.trim().toLowerCase();
    return data.filter((dept) => {
      const nameTh = (dept.nameTh || "").toLowerCase();
      const nameEn = (dept.nameEn || "").toLowerCase();
      const description = (dept.description || "").toLowerCase();
      
      return nameTh.includes(query) || nameEn.includes(query) || description.includes(query);
    });
  }, [data, searchQuery]);

  // ===== Pagination =====
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ===== Modals =====
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // ===== Server Actions =====
  const [createState, createAction] = useActionState(createDepartment as unknown as (state: { ok: boolean; error?: string; stamp: number }, formData: FormData) => Promise<{ ok: boolean; error?: string; stamp: number }>, { ok: false, stamp: 0 });
  const [updateState, updateAction] = useActionState(updateDepartment as unknown as (state: { ok: boolean; error?: string; stamp: number }, formData: FormData) => Promise<{ ok: boolean; error?: string; stamp: number }>, { ok: false, stamp: 0 });

  // Handle create success/error
  useEffect(() => {
    if (!createState.stamp) return;
    
    if (createState.ok) {
      showToast("สร้างแผนกสำเร็จ", "success");
      setIsCreateModalOpen(false);
      // Reset form
      createAction(new FormData());
    } else if (createState.error) {
      showToast(createState.error, "error");
    }
  }, [createState, createAction]);

  // Handle update success/error
  useEffect(() => {
    if (!updateState.stamp) return;
    
    if (updateState.ok) {
      showToast("แก้ไขแผนกสำเร็จ", "success");
      setEditingDepartment(null);
      // Reset form
      updateAction(new FormData());
    } else if (updateState.error) {
      showToast(updateState.error, "error");
    }
  }, [updateState, updateAction]);

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  // เพิ่ม export columns
  const exportColumns = useMemo(
    () => [
      { header: "No.", value: (_r: Department, i: number) => i + 1 },
      { header: "Name (Thai)", value: (r: Department) => r.nameTh || "-" },
      { header: "Name (English)", value: (r: Department) => r.nameEn || "-" },
      { header: "Description", value: (r: Department) => r.description || "-" },
      { header: "Created", value: (r: Department) => new Date(r.createdAt).toLocaleDateString() },
      { header: "Updated", value: (r: Department) => new Date(r.updatedAt).toLocaleDateString() },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Top bar: Search + New */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold text-black">จัดการแผนก</h1>
        <div className="flex items-center gap-2 sm:ml-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ค้นหาแผนก..."
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-create whitespace-nowrap"
          >
            + สร้างแผนกใหม่
          </button>

          {/* เพิ่ม ExportButtons */}
          <ExportButtons<Record<string, unknown>>
            data={filteredData as unknown as Record<string, unknown>[]}
            columns={exportColumns as unknown as { header: string; value: (row: Record<string, unknown>, index: number) => unknown }[]}
            filename="Departments"
            fileBase="Departments"
            pdf={{
              orientation: "l",
              title: "Departments",
              tableWidth: "wrap",
            }}
            companyName="Wise Attitude"
            logoUrl="/assets/images/Logo.jpg"
          />
        </div>
      </div>

      {/* Table */}
      <DepartmentTable 
        departments={currentData} 
        onEdit={handleEdit} 
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Create Modal */}
      <DepartmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      {/* Edit Modal */}
      <DepartmentModal
        isOpen={!!editingDepartment}
        onClose={() => setEditingDepartment(null)}
        department={editingDepartment}
        mode="edit"
      />
    </div>
  );
}
