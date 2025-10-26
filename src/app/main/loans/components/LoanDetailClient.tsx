"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import { Skeleton, SkeletonCard } from "../../../../components/ui/Skeleton";
import StatusFormClient from "./StatusFormClient";
import HeaderFormClient from "./HeaderFormClient";
import AddItemsClient from "./AddItemsClient";
import LoanExportButtons from "./LoanExportButtons";
import EditLoanModal from "./EditLoanModal";
import EditLoanItemModal from "./EditLoanItemModal";
import DeleteLoanItemModal from "./DeleteLoanItemModal";
import { Edit, Trash2 } from "lucide-react";

type Loan = {
  id: number;
  status: "OPEN" | "USE" | "CLOSED" | "CANCELLED" | "OVERDUE";
  returnedDate: string | null;
  note: string;
  borrower: { id: number; name: string; employeeID: string } | null;
  borrowerPosition?: string | null;
  items: Array<{
    id: number;
    sku: string;
    name: string;
    isSerialized: boolean;
    serialNumber?: string | null;
    quantity: number;
    startAt?: string;
    dueAt?: string | null;
    returnedAt?: string | null;
    note?: string | null;
  }>;
};

type Employee = { id: number; name: string; employeeID: string };

type Asset = {
  id: number; sku: string; name: string; isSerialized: boolean;
  totalQty: number; availableQty: number; availableUnits: { id: number; serialNumber: string; status: string }[];
  category?: { id: number; name: string } | null;
};

type AssetCategory = {
  id: number; name: string;
};

export default function LoanDetailClient({ 
  loan, 
  employees,
  assets,
  categories
}: { 
  loan: Loan;
  employees: Employee[];
  assets: Asset[];
  categories: AssetCategory[];
}) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItemModalOpen, setEditItemModalOpen] = useState(false);
  const [deleteItemModalOpen, setDeleteItemModalOpen] = useState(false);
  const [selectedLoanItem, setSelectedLoanItem] = useState<{
    id: number;
    assetId: number;
    assetName: string;
    assetSku: string;
    isSerialized: boolean;
    quantity: number;
    serialNumber?: string | null;
    startAt?: string | null;
    dueAt?: string | null;
    returnedAt?: string | null;
    note?: string | null;
  } | null>(null);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);



  // Handle edit modal close
  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    // Refresh the page to update the data
    window.location.reload();
  };

  // Handle edit loan item
  const handleEditLoanItem = (loanItem: {
    id: number;
    sku: string;
    name: string;
    isSerialized: boolean;
    serialNumber?: string | null;
    quantity: number;
    startAt?: string | null;
    dueAt?: string | null;
    returnedAt?: string | null;
    note?: string | null;
  }) => {
    // หา assetId จาก assets array
    const asset = assets.find(a => a.sku === loanItem.sku && a.name === loanItem.name);
    
    setSelectedLoanItem({
      id: loanItem.id,
      assetId: asset?.id || 0,
      assetName: loanItem.name,
      assetSku: loanItem.sku,
      isSerialized: loanItem.isSerialized,
      quantity: loanItem.quantity,
      serialNumber: loanItem.serialNumber,
      startAt: loanItem.startAt,
      dueAt: loanItem.dueAt,
      returnedAt: loanItem.returnedAt,
      note: loanItem.note
    });
    setEditItemModalOpen(true);
  };

  // Handle edit item modal close
  const handleEditItemModalClose = () => {
    setEditItemModalOpen(false);
    setSelectedLoanItem(null);
  };

  // Handle edit item success
  const handleEditItemSuccess = () => {
    // Refresh the page to update the data
    window.location.reload();
  };

  // Handle delete loan item
  const handleDeleteLoanItem = (loanItem: {
    id: number;
    sku: string;
    name: string;
    isSerialized: boolean;
    serialNumber?: string | null;
    quantity: number;
    startAt?: string | null;
    dueAt?: string | null;
    returnedAt?: string | null;
    note?: string | null;
  }) => {
    // หา assetId จาก assets array
    const asset = assets.find(a => a.sku === loanItem.sku && a.name === loanItem.name);
    
    setSelectedLoanItem({
      id: loanItem.id,
      assetId: asset?.id || 0,
      assetName: loanItem.name,
      assetSku: loanItem.sku,
      isSerialized: loanItem.isSerialized,
      quantity: loanItem.quantity,
      serialNumber: loanItem.serialNumber,
      startAt: loanItem.startAt,
      dueAt: loanItem.dueAt,
      returnedAt: loanItem.returnedAt,
      note: loanItem.note
    });
    setDeleteItemModalOpen(true);
  };

  // Handle delete item modal close
  const handleDeleteItemModalClose = () => {
    setDeleteItemModalOpen(false);
    setSelectedLoanItem(null);
  };

  // Handle delete item success
  const handleDeleteItemSuccess = () => {
    // Refresh the page to update the data
    window.location.reload();
  };

  // Show skeleton loading while data is loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton height="32px" className="w-48" />
          <Skeleton height="16px" className="w-64" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">การยืม #{loan.id}</h1>
          <p className="text-gray-600 mt-1">
            สถานะ: <span className={`font-semibold ${
              loan.status === 'OPEN' ? 'text-blue-600' :
              loan.status === 'USE' ? 'text-purple-600' :
              loan.status === 'CLOSED' ? 'text-green-600' :
              loan.status === 'OVERDUE' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {loan.status === 'OPEN' ? 'เปิดใช้งาน' :
               loan.status === 'USE' ? 'กำลังใช้งาน' :
               loan.status === 'CLOSED' ? 'ปิดการยืม' :
               loan.status === 'OVERDUE' ? 'เกินกำหนด' :
               loan.status === 'CANCELLED' ? 'ยกเลิก' :
               loan.status}
            </span>
            {loan.returnedDate && (
              <span className="text-gray-600 ml-4">
                | กำหนดคืน: {dayjs(loan.returnedDate).format("DD/MM/YYYY")}
              </span>
            )}
          </p>
        </div>
        
        {/* Export Buttons */}
        <LoanExportButtons
          loanId={loan.id}
          borrower={loan.borrower}
          borrowerPosition={loan.borrowerPosition}
          status={loan.status === "USE" ? "OPEN" : loan.status}
          items={loan.items}
          companyName="Wise Attitude"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Status Form */}
          <StatusFormClient 
            loanId={loan.id} 
            status={loan.status} 
          />

          {/* Header Form */}
          <HeaderFormClient
            loanId={loan.id}
            borrowerId={loan.borrower?.id || 0}
            dueDate={""}
            note={loan.note}
            employees={employees}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Add Items */}
          <AddItemsClient 
            loanId={loan.id} 
            assets={assets}
            categories={categories}
          />

          {/* Items Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
            <div className="mb-4 text-lg font-semibold text-gray-900">รายการที่ยืม</div>
            
            {loan.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead className="bg-gray-50">
                    <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:text-center">
                      <th className="w-16 font-semibold text-gray-700">ลำดับ</th>
                      <th className="w-48 font-semibold text-gray-700">SKU</th>
                      <th className="font-semibold text-gray-700">ทรัพย์สิน</th>
                      <th className="w-32 font-semibold text-gray-700">โหมด</th>
                      <th className="w-40 font-semibold text-gray-700">จำนวน / SN</th>
                      <th className="w-48 font-semibold text-gray-700">วันที่ยืม</th>
                      <th className="w-48 font-semibold text-gray-700">วันที่คืนจริง</th>
                      <th className="w-48 font-semibold text-gray-700">หมายเหตุ</th>
                      <th className="w-32 font-semibold text-gray-700">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-gray-100">
                    {loan.items.map((item, idx) => (
                      <tr key={item.id} className="[&>td]:px-3 [&>td]:py-3 [&>td]:text-center text-gray-800 hover:bg-gray-50 transition-colors">
                        <td className="font-medium">{idx + 1}</td>
                        <td className="font-mono">{item.sku}</td>
                        <td>{item.name}</td>
                        <td>{item.isSerialized ? "SN" : "จำนวน"}</td>
                        <td>{item.isSerialized ? item.serialNumber : item.quantity}</td>
                        <td className="text-gray-600">
                          {item.startAt ? dayjs(item.startAt).format("DD/MM/YYYY") : "-"}
                        </td>
                        <td className="text-gray-600">
                          {item.returnedAt ? dayjs(item.returnedAt).format("DD/MM/YYYY") : "-"}
                        </td>
                        <td className="text-left text-sm text-gray-600 max-w-xs">
                          {item.note ? (
                            <div className="truncate" title={item.note}>
                              {item.note}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            {/* Edit Item Button */}
                            <button
                              onClick={() => handleEditLoanItem(item)}
                              disabled={loan.status === 'CLOSED' || loan.status === 'CANCELLED'}
                              className="inline-flex items-center gap-1
                                         text-blue-600 bg-blue-50 hover:bg-blue-100
                                         disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed
                                         font-medium rounded text-xs px-2 py-1 transition-colors"
                              title={loan.status === 'CLOSED' || loan.status === 'CANCELLED' ? 'ไม่สามารถแก้ไขได้' : 'แก้ไขรายการสินทรัพย์'}
                            >
                              <Edit className="w-3 h-3" />
                              แก้ไข
                            </button>
                            
                            {/* Delete Item Button */}
                            <button
                              onClick={() => handleDeleteLoanItem(item)}
                              disabled={loan.status === 'CLOSED' || loan.status === 'CANCELLED'}
                              className="inline-flex items-center gap-1
                                         text-red-600 bg-red-50 hover:bg-red-100
                                         disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed
                                         font-medium rounded text-xs px-2 py-1 transition-colors"
                              title={loan.status === 'CLOSED' || loan.status === 'CANCELLED' ? 'ไม่สามารถลบได้' : 'ลบรายการสินทรัพย์'}
                            >
                              <Trash2 className="w-3 h-3" />
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                ไม่มีรายการที่ยืม
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Loan Modal */}
      <EditLoanModal
        isOpen={editModalOpen}
        onClose={handleEditModalClose}
        loanData={{
          id: loan.id,
          borrowerId: loan.borrower?.id || 0,
          note: loan.note,
          status: loan.status
        }}
        onSuccess={handleEditSuccess}
      />

              {/* Edit Loan Item Modal */}
        {selectedLoanItem && (
          <EditLoanItemModal
            isOpen={editItemModalOpen}
            onClose={handleEditItemModalClose}
            loanItemData={selectedLoanItem}
            assets={assets}
            loanStatus={loan.status}
            onSuccess={handleEditItemSuccess}
          />
        )}

        {/* Delete Loan Item Modal */}
        {selectedLoanItem && (
          <DeleteLoanItemModal
            isOpen={deleteItemModalOpen}
            onClose={handleDeleteItemModalClose}
            loanItemData={selectedLoanItem}
            onSuccess={handleDeleteItemSuccess}
          />
        )}
      </div>
    );
  }
