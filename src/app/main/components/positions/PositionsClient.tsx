"use client";
import dayjs from "dayjs";
import { useEffect, useMemo, useState, useActionState } from "react";
import { createPosition, updatePosition } from "@/app/actions/positions";
import { showToast } from "@/lib/sweetalert";
import SearchBar from "@/app/main/components/common/SearchBar";
import Pagination from "@/app/main/components/common/Pagination";
import PositionTable from "@/app/main/components/positions/PositionTable";
import PositionModal from "@/app/main/components/positions/PositionModal";
import ExportButtons from "@/app/main/components/common/ExportButtons";

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

interface Department {
  id: number;
  label: string;
}

export default function PositionsClient({ 
  data, 
  departments 
}: { 
  data: Position[];
  departments: Department[];
}) {
  // ===== Search =====
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    
    const query = searchQuery.trim().toLowerCase();
    return data.filter((pos) => {
      const nameTh = (pos.nameTh || "").toLowerCase();
      const nameEn = (pos.nameEn || "").toLowerCase();
      const description = (pos.description || "").toLowerCase();
      const department = (pos.departmentLabel || "").toLowerCase();
      
      return nameTh.includes(query) || nameEn.includes(query) || description.includes(query) || department.includes(query);
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
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  // ===== Server Actions =====
  const [createState, createAction] = useActionState(createPosition as unknown as (state: { ok: boolean; error?: string; stamp: number }, formData: FormData) => Promise<{ ok: boolean; error?: string; stamp: number }>, { ok: false, stamp: 0 });
  const [updateState, updateAction] = useActionState(updatePosition as unknown as (state: { ok: boolean; error?: string; stamp: number }, formData: FormData) => Promise<{ ok: boolean; error?: string; stamp: number }>, { ok: false, stamp: 0 });

  // Handle create success/error
  useEffect(() => {
    if (!createState.stamp) return;
    
    if (createState.ok) {
      showToast("สร้างตำแหน่งสำเร็จ", "success");
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
      showToast("แก้ไขตำแหน่งสำเร็จ", "success");
      setEditingPosition(null);
      // Reset form
      updateAction(new FormData());
    } else if (updateState.error) {
      showToast(updateState.error, "error");
    }
  }, [updateState, updateAction]);

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
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
      { header: "No.", value: (_r: Position, i: number) => i + 1 },
      { header: "Name (Thai)", value: (r: Position) => r.nameTh || "-" },
      { header: "Name (English)", value: (r: Position) => r.nameEn || "-" },
      { header: "Description", value: (r: Position) => r.description || "-" },
      { header: "Level", value: (r: Position) => r.level },
      { header: "Department", value: (r: Position) => r.departmentLabel },
      { header: "Created", value: (r: Position) => dayjs(r.createdAt).format("YYYY-MM-DD HH:mm") },
      { header: "Updated", value: (r: Position) => dayjs(r.updatedAt).format("YYYY-MM-DD HH:mm") },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Top bar: Search + New */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold text-black">จัดการตำแหน่ง</h1>
        <div className="flex items-center gap-2 sm:ml-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ค้นหาตำแหน่ง..."
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-create whitespace-nowrap"
          >
            + สร้างตำแหน่งใหม่
          </button>

          {/* เพิ่ม ExportButtons */}
          <ExportButtons<Record<string, unknown>>
            data={filteredData as unknown as Record<string, unknown>[]}
            columns={exportColumns as unknown as { header: string; value: (row: Record<string, unknown>, index: number) => unknown }[]}
            filename="Positions"
            fileBase="Positions"
            pdf={{
              orientation: "l",
              title: "Positions",
              tableWidth: "wrap",
            }}
            companyName="Wise Attitude"
            logoUrl="/assets/images/Logo.jpg"
          />
        </div>
      </div>

      {/* Table */}
      <PositionTable 
        positions={currentData} 
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
      <PositionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        departments={departments}
        mode="create"
      />

      {/* Edit Modal */}
      <PositionModal
        isOpen={!!editingPosition}
        onClose={() => setEditingPosition(null)}
        position={editingPosition}
        departments={departments}
        mode="edit"
      />
    </div>
  );
}
