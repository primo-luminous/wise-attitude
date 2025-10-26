"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { createAssetCategory, updateAssetCategory, deleteAssetCategory } from "@/app/actions/asset-categories";
import { showToast } from "@/lib/sweetalert";
import SearchBar from "@/app/main/components/common/SearchBar";
import Pagination from "@/app/main/components/common/Pagination";
import CategoryTable from "./CategoryTable";
import CategoryModal from "./CategoryModal";
import ExportButtons from "@/app/main/components/common/ExportButtons";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  id: number;
  name: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Categories({ data }: { data: Category[] }) {
  const { t } = useLanguage();
  
  // ===== Search =====
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    
    const query = searchQuery.trim().toLowerCase();
    return data.filter((category) => {
      const name = (category.name || "").toLowerCase();
      const note = (category.note || "").toLowerCase();
      
      return name.includes(query) || note.includes(query);
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // ===== Server Actions =====
  const [createState, createAction] = useActionState(async (prev: { ok: boolean; error?: string; stamp: number }, formData: FormData) => {
    try {
      const res = await createAssetCategory(formData);
      const ok = (res && "ok" in res ? (res as { ok: boolean }).ok : true) as boolean;
      const error = (res as { error?: string })?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      return { ok: false, error: (e && typeof e === 'object' && 'message' in e ? (e as { message: string }).message : "เกิดข้อผิดพลาด"), stamp: Date.now() };
    }
  }, { ok: false, error: undefined, stamp: 0 });

  const [updateState, updateAction] = useActionState(async (prev: { ok: boolean; error?: string; stamp: number }, formData: FormData) => {
    try {
      const res = await updateAssetCategory(formData);
      const ok = (res && "ok" in res ? (res as { ok: boolean }).ok : true) as boolean;
      const error = (res as { error?: string })?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      return { ok: false, error: (e && typeof e === 'object' && 'message' in e ? (e as { message: string }).message : "เกิดข้อผิดพลาด"), stamp: Date.now() };
    }
  }, { ok: false, error: undefined, stamp: 0 });

  // Handle create success/error
  useEffect(() => {
    if (!createState.stamp) return;
    
    if (createState.ok) {
      showToast("สร้างหมวดหมู่สำเร็จ", "success");
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
      showToast("แก้ไขหมวดหมู่สำเร็จ", "success");
      setEditingCategory(null);
      // Reset form
      updateAction(new FormData());
    } else if (updateState.error) {
      showToast(updateState.error, "error");
    }
  }, [updateState, updateAction]);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteAssetCategory(id);
      
      if (result.ok) {
        showToast("ลบหมวดหมู่สำเร็จ", "success");
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        showToast(result.error || "เกิดข้อผิดพลาดในการลบ", "error");
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast("เกิดข้อผิดพลาดในการลบ", "error");
    }
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
      { header: "No.", value: (_r: Category, i: number) => i + 1 },
      { header: "Name", value: (r: Category) => r.name || "-" },
      { header: "Note", value: (r: Category) => r.note || "-" },
      { header: "Created", value: (r: Category) => new Date(r.createdAt).toLocaleDateString() },
      { header: "Updated", value: (r: Category) => new Date(r.updatedAt).toLocaleDateString() },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Top bar: Search + New */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold text-black">{t("จัดการหมวดหมู่ทรัพย์สิน")}</h1>
        <div className="flex items-center gap-2 sm:ml-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("ค้นหาหมวดหมู่...")}
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-create whitespace-nowrap"
          >
            + {t("สร้างหมวดหมู่ใหม่")}
          </button>

          {/* เพิ่ม ExportButtons */}
          <ExportButtons<Record<string, unknown>>
            data={filteredData as unknown as Record<string, unknown>[]}
            columns={exportColumns as unknown as { key: string; label: string; header: string }[]}
            filename="AssetCategories"
            fileBase="AssetCategories"
            pdf={{
              orientation: "l",
              title: "Asset Categories",
              tableWidth: "wrap",
            }}
            companyName="Wise Attitude"
            logoUrl="/assets/images/Logo.jpg"
          />
        </div>
      </div>

      {/* Table */}
      <CategoryTable 
        categories={currentData} 
        startIndex={startIndex}
        onEdit={handleEdit} 
        onDelete={handleDelete}
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
      <CategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      {/* Edit Modal */}
      <CategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        mode="edit"
      />
    </div>
  );
}
