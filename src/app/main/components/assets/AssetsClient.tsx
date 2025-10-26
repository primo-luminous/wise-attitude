"use client";

import React, { useEffect, useMemo, useState, useActionState } from "react";
import dayjs from "dayjs";
import { showToast } from "../../../../lib/sweetalert";
import {
  createAsset,
  updateAsset,
  deleteAsset,
  addAssetUnits,
  updateAssetUnit,
  deleteAssetUnit,
} from "@/app/actions/assets";
import ExportButtons from "@/app/main/components/common/ExportButtons";
import SearchBar from "@/app/main/components/common/SearchBar";
import Pagination from "@/app/main/components/common/Pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import ManageUnitsModal from "./ManageUnitsModal";
import { Skeleton, SkeletonCard } from '../../../../components/ui/Skeleton';
import { TableLoading } from '../../../../components/ui/GlobalLoading';

/* ========= types ========= */
type Category = { id: number; name: string };
type BorrowerLite = { id: number; employeeID: string; name: string; count: number };

type ActionResult = {
  ok: boolean;
  error?: string;
  stamp: number;
};

type Asset = {
  id: number;
  sku: string;
  name: string;
  categoryId: number | null;
  category?: { id: number; name: string } | null;
  description: string | null;
  imageUrl: string | null;
  isSerialized: boolean;
  totalQty: number;
  status: "ACTIVE" | "INACTIVE" | "LOST" | "BROKEN";
  createdAt: string;
  updatedAt: string;

  // UI fields for new schema
  purchaseDate?: string | null;
  purchasePrice?: string | number | null;
  warrantyMonths?: number | null;
  warrantyUntil?: string | null;

  totalAll: number;
  loanedCount: number;
  availableCount: number;
  borrowers?: BorrowerLite[];

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

export default function AssetsClient({
  data,
  categories,
}: {
  data: Asset[];
  categories: Category[];
}) {
  const { t } = useLanguage();
  
  // ===== Search =====
  const [searchQuery, setSearchQuery] = useState("");
  
  // ===== Data State =====
  const [assetsData, setAssetsData] = useState<Asset[]>(data);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return assetsData;
    
    const query = searchQuery.trim().toLowerCase();
    return assetsData.filter((asset) => {
      const sku = (asset.sku || "").toLowerCase();
      const name = (asset.name || "").toLowerCase();
      const category = (asset.category?.name || "").toLowerCase();
      const description = (asset.description || "").toLowerCase();
      
      return sku.includes(query) || name.includes(query) || category.includes(query) || description.includes(query);
    });
  }, [assetsData, searchQuery]);

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
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [managingUnits, setManagingUnits] = useState<Asset | null>(null);

  // ===== Server Actions =====
  const [createState, createAction] = useActionState(async (prev: ActionResult, formData: FormData) => {
    try {
      const res = await createAsset(formData);
      const ok = (res && "ok" in res ? (res as ActionResult).ok : true) as boolean;
      const error = (res as ActionResult)?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      return { ok: false, error: errorMessage, stamp: Date.now() };
    }
  }, { ok: false, error: undefined, stamp: 0 });

  const [updateState, updateAction] = useActionState(async (prev: ActionResult, formData: FormData) => {
    try {
      const res = await updateAsset(formData);
      const ok = (res && "ok" in res ? (res as ActionResult).ok : true) as boolean;
      const error = (res as ActionResult)?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      return { ok: false, error: errorMessage, stamp: Date.now() };
    }
  }, { ok: false, error: undefined, stamp: 0 });

  const [deleteState, deleteAction] = useActionState(async (prev: ActionResult, formData: FormData) => {
    try {
      const res = await deleteAsset(formData);
      const ok = (res && "ok" in res ? (res as ActionResult).ok : true) as boolean;
      const error = (res as ActionResult)?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      return { ok: false, error: errorMessage, stamp: Date.now() };
    }
  }, { ok: false, error: undefined, stamp: 0 });

  const [addUnitsState, addUnitsAction] = useActionState(async (prev: ActionResult, formData: FormData) => {
    try {
      const res = await addAssetUnits(formData);
      const ok = (res && "ok" in res ? (res as ActionResult).ok : true) as boolean;
      const error = (res as ActionResult)?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      return { ok: false, error: errorMessage, stamp: Date.now() };
    }
  }, { ok: false, error: undefined, stamp: 0 });

  const [updateUnitState, updateUnitAction] = useActionState(async (prev: ActionResult, formData: FormData) => {
    try {
      const res = await updateAssetUnit(formData);
      const ok = (res && "ok" in res ? (res as ActionResult).ok : true) as boolean;
      const error = (res as ActionResult)?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      return { ok: false, error: errorMessage, stamp: Date.now() };
    }
  }, { ok: false, error: undefined, stamp: 0 });

  const [deleteUnitState, deleteUnitAction] = useActionState(async (prev: ActionResult, formData: FormData) => {
    try {
      const res = await deleteAssetUnit(formData);
      const ok = (res && "ok" in res ? (res as ActionResult).ok : true) as boolean;
      const error = (res as ActionResult)?.error as string | undefined;
      return { ok, error, stamp: Date.now() };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      return { ok: false, error: errorMessage, stamp: Date.now() };
    }
  }, { ok: false, error: undefined, stamp: 0 });

  // Handle create success/error
  useEffect(() => {
    if (!createState.stamp) return;
    
    if (createState.ok) {
      showToast("สร้างทรัพย์สินสำเร็จ", "success");
      setIsCreateModalOpen(false);
      // The server action already calls revalidatePath("/main/assets")
      // Data will be updated automatically through Next.js revalidation
    } else if (createState.error) {
      showToast(createState.error, "error");
    }
  }, [createState]);

  // Handle update success/error
  useEffect(() => {
    if (!updateState.stamp) return;
    
    if (updateState.ok) {
      showToast("แก้ไขทรัพย์สินสำเร็จ", "success");
      setEditingAsset(null);
      // The server action already calls revalidatePath("/main/assets")
      // Data will be updated automatically through Next.js revalidation
    } else if (updateState.error) {
      showToast(updateState.error, "error");
    }
  }, [updateState]);

  // Handle delete success/error
  useEffect(() => {
    if (!deleteState.stamp) return;
    
    if (deleteState.ok) {
      showToast("ลบทรัพย์สินสำเร็จ", "success");
      // The server action already calls revalidatePath("/main/assets")
      // Data will be updated automatically through Next.js revalidation
    } else if (deleteState.error) {
      showToast(deleteState.error, "error");
    }
  }, [deleteState]);

  // Handle add units success/error
  useEffect(() => {
    if (!addUnitsState.stamp) return;
    
    if (addUnitsState.ok) {
      showToast("เพิ่ม Serial Number สำเร็จ", "success");
      // The server action already calls revalidatePath("/main/assets")
      // Data will be updated automatically through Next.js revalidation
    } else if (addUnitsState.error) {
      showToast(addUnitsState.error, "error");
    }
  }, [addUnitsState]);

  // Handle update unit success/error
  useEffect(() => {
    if (!updateUnitState.stamp) return;
    
    if (updateUnitState.ok) {
      showToast("แก้ไข Serial Number สำเร็จ", "success");
      // The server action already calls revalidatePath("/main/assets")
      // Data will be updated automatically through Next.js revalidation
    } else if (updateUnitState.error) {
      showToast(updateUnitState.error, "error");
    }
  }, [updateUnitState]);

  // Handle delete unit success/error
  useEffect(() => {
    if (!deleteUnitState.stamp) return;
    
    if (deleteUnitState.ok) {
      showToast("ลบ Serial Number สำเร็จ", "success");
      // The server action already calls revalidatePath("/main/assets")
      // Data will be updated automatically through Next.js revalidation
    } else if (deleteUnitState.error) {
      showToast(deleteUnitState.error, "error");
    }
  }, [deleteUnitState]);

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
  };

  const handleDelete = async (id: number) => {
    try {
      const formData = new FormData();
      formData.append('id', id.toString());
      deleteAction(formData);
    } catch (error) {
      console.error('Error deleting asset:', error);
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
      { header: "No.", value: (_r: Asset, i: number) => i + 1 },
      { header: "SKU", value: (r: Asset) => r.sku },
      { header: "Name", value: (r: Asset) => r.name },
      { header: "Category", value: (r: Asset) => r.category?.name ?? "-" },
      { header: "Mode", value: (r: Asset) => (r.isSerialized ? "Serialized (SN)" : "Bulk") },
      { header: "Total", value: (r: Asset) => r.totalAll },
      { header: "Loaned", value: (r: Asset) => r.loanedCount },
      { header: "Available", value: (r: Asset) => r.availableCount },
      { header: "Updated", value: (r: Asset) => dayjs(r.updatedAt).format("YYYY-MM-DD HH:mm") },
    ],
    []
  );

  // Show skeleton loading while data is loading
  if (false) { // Set to true to show skeleton
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton height="32px" className="w-48" />
            <Skeleton height="16px" className="w-64" />
          </div>
          <div className="flex space-x-3">
            <Skeleton height="40px" className="w-32" />
            <Skeleton height="40px" className="w-32" />
            <Skeleton height="40px" className="w-32" />
          </div>
        </div>

        {/* Search and Filter Skeleton */}
        <div className="flex space-x-4">
          <Skeleton height="40px" className="w-80" />
          <Skeleton height="40px" className="w-32" />
          <Skeleton height="40px" className="w-32" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top bar: Search + New */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold text-black">{t("จัดการทรัพย์สิน")}</h1>
        <div className="flex items-center gap-2 sm:ml-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("ค้นหา SKU/ชื่อ/หมวดหมู่...")}
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-create whitespace-nowrap"
          >
            + {t("สร้างทรัพย์สินใหม่")}
          </button>

          {/* เพิ่ม ExportButtons */}
          <ExportButtons<Record<string, unknown>>
            data={filteredData as unknown as Record<string, unknown>[]}
            columns={exportColumns as unknown as Array<{ header: string; value: (r: Record<string, unknown>, i: number) => string | number }>}
            filename="Assets"
            fileBase="Assets"
            pdf={{
              orientation: "l",
              title: "Assets",
              tableWidth: "wrap",
            }}
            companyName="Wise Attitude"
            logoUrl="/assets/images/Logo.jpg"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                  {t("ลำดับ")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-48">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t("ชื่อ")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-48">
                  {t("หมวดหมู่")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-36">
                  {t("โหมด")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40">
                  {t("สต็อก (รวม/ยืม)")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-44">
                  {t("อัปเดต")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-44">
                  {t("การดำเนินการ")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((asset, index) => {
                const serial = startIndex + index + 1;
                const mode = asset.isSerialized ? "Serialized (SN)" : "Bulk";
                
                // Debug: Log asset data
                console.log(`Asset ${asset.id}:`, {
                  sku: asset.sku,
                  name: asset.name,
                  imageUrl: asset.imageUrl,
                  hasImage: !!asset.imageUrl
                });
                
                return (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {serial}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {asset.imageUrl ? (
                          <>
                            {/* Debug: Log the imageUrl */}
                            {console.log(`Asset ${asset.id} imageUrl:`, asset.imageUrl)}
                            <img 
                              src={asset.imageUrl} 
                              alt={asset.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                console.error(`Failed to load image: ${asset.imageUrl}`, e);
                                e.currentTarget.style.display = 'none';
                              }}
                              onLoad={() => {
                                console.log(`Successfully loaded image: ${asset.imageUrl}`);
                              }}
                            />
                          </>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">ไม่มีรูป</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {asset.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {asset.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {asset.category?.name || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {mode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" title={`Available: ${asset.availableCount}`}>
                      <div className="text-sm text-gray-500">
                        {asset.totalAll} / {asset.loanedCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {dayjs(asset.updatedAt).format("YYYY-MM-DD HH:mm")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        {asset.isSerialized && (
                          <button
                            onClick={() => setManagingUnits(asset)}
                            className="inline-flex items-center gap-2
                                       text-gray-900 bg-gradient-to-r from-blue-200 via-blue-300 to-cyan-200
                                       hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-100
                                       font-medium rounded-lg text-sm px-3 py-2"
                            title="จัดการ Serial Number"
                          >
                            SN
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(asset)}
                          className="inline-flex items-center gap-2
                                     text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200
                                     hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100
                                     font-medium rounded-lg text-sm px-3 py-2"
                          title="แก้ไข"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="inline-flex items-center gap-2
                                     text-white bg-gradient-to-br from-pink-500 to-orange-400
                                     hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200
                                     font-medium rounded-lg text-sm px-3 py-2"
                          title="ลบ"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    {t("ไม่มีข้อมูล")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
      {isCreateModalOpen && (
        <CreateModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          categories={categories}
          createAction={createAction}
        />
      )}

      {/* Edit Modal */}
      {editingAsset && (
        <EditModal
          open={!!editingAsset}
          asset={editingAsset}
          categories={categories}
          onClose={() => setEditingAsset(null)}
          updateAction={updateAction}
        />
      )}

      {/* Manage Units Modal */}
      {managingUnits && (
        <ManageUnitsModal
          asset={managingUnits}
          onClose={() => setManagingUnits(null)}
          addUnitsAction={addUnitsAction}
          updateUnitAction={updateUnitAction}
          deleteUnitAction={deleteUnitAction}
        />
      )}
    </div>
  );
}
