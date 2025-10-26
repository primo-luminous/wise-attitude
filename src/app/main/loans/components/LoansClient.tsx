"use client";

import Link from "next/link";
import React, { useState } from "react";
import dayjs from "dayjs";
// ลบ import ที่ไม่ใช้แล้ว
import { Eye } from "lucide-react";

type LoanRow = {
  id: number;
  status: "OPEN" | "CLOSED" | "CANCELLED" | "OVERDUE";
  dueDate: string | null; // ISO
  itemsCount: number;
  borrower: { id: number; name: string; employeeID: string } | null;
  note?: string | null; // หมายเหตุ
  createdAt?: string; // วันที่สร้างการยืม
};

export default function LoansClient({ data }: { data: LoanRow[] }) {
  // ไม่ต้องมี loading state เพราะข้อมูลมาจาก server แล้ว



  // ===== Search (debounced) =====
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = React.useMemo(() => {
    if (!debounced) return data;
    return data.filter((r) => {
      const idStr = `#${r.id}`;
      const borrowerName = (r.borrower?.name || "").toLowerCase();
      const borrowerEmp = (r.borrower?.employeeID || "").toLowerCase();
      const status = r.status.toLowerCase();
      return (
        idStr.toLowerCase().includes(debounced) ||
        borrowerName.includes(debounced) ||
        borrowerEmp.includes(debounced) ||
        status.includes(debounced)
      );
    });
  }, [data, debounced]);

  // ===== Pagination =====
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  React.useEffect(() => setPage(1), [debounced, pageSize]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const currentRows = React.useMemo(
    () => filtered.slice(start, start + pageSize),
    [filtered, start, pageSize]
  );

  const columns = React.useMemo(
    () => [
      { header: "ID", value: (r: LoanRow) => `#${r.id}` },
      { header: "EmployeeID", value: (r: LoanRow) => r.borrower?.employeeID ?? "-" },
      { header: "Borrower", value: (r: LoanRow) => r.borrower?.name ?? "-" },
      { header: "Status", value: (r: LoanRow) => r.status },
      {
        header: "Due Date",
        value: (r: LoanRow) => (r.dueDate ? dayjs(r.dueDate).format("YYYY-MM-DD") : "-"),
      },
      { header: "Items", value: (r: LoanRow) => r.itemsCount },
    ],
    []
  );

  // ไม่ต้องมี loading state เพราะข้อมูลมาจาก server แล้ว

  return (
    <div className="space-y-4">
      {/* Top bar: Search + New */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold text-black">การยืมคืน</h1>
        <div className="flex items-center gap-2 sm:ml-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา #ID / EmployeeID / Name / Status…"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2
                       text-black placeholder:text-gray-500 focus:outline-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Link
            href="/main/loans/new"
            className="btn-create whitespace-nowrap"
          >
            + สร้างการยืมใหม่
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-lg border border-gray-200">
        <table className="min-w-[820px] w-full text-sm text-center">
          <thead className="bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:text-center">
              <th className="w-20 font-semibold text-gray-700">ลำดับ</th>
              <th className="font-semibold text-gray-700">ผู้ยืม</th>
              <th className="w-36 font-semibold text-gray-700">สถานะ</th>
              <th className="w-40 font-semibold text-gray-700">วันกำหนดคืน</th>
              <th className="w-28 font-semibold text-gray-700">จำนวนรายการ</th>
              <th className="w-32 font-semibold text-gray-700">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-gray-100">
            {currentRows.map((l, idx) => (
              <tr
                key={l.id}
                className="[&>td]:px-3 [&>td]:py-3 [&>td]:text-center text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <td className="font-medium">{idx + 1}</td>
                <td>
                  {l.borrower ? (
                    <>
                      {l.borrower.employeeID} — {l.borrower.name}
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    l.status === 'OPEN' 
                      ? 'bg-blue-100 text-blue-800' 
                      : l.status === 'CLOSED'
                      ? 'bg-green-100 text-green-800'
                      : l.status === 'OVERDUE'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="text-gray-600">
                  {l.dueDate ? dayjs(l.dueDate).format("YYYY-MM-DD") : "-"}
                </td>
                <td className="font-medium">{l.itemsCount}</td>
                <td>
                  <Link
                    href={`/main/loans/${l.id}`}
                    className="inline-flex items-center gap-2
                               text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200
                               hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100
                               font-medium rounded-lg text-sm px-4 py-2"
                  >
                    <Eye className="w-4 h-4" />
                    เปิด
                  </Link>
                </td>
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom: Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Items per page</label>
            <select
              className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value || 10))}
            >
              {[5, 10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="text-gray-700">
            แสดง <b>{currentRows.length}</b> จาก <b>{total}</b> การยืม
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            ก่อนหน้า
          </button>
          <span className="text-gray-700">
            หน้า <b>{page}</b> / <b>{totalPages}</b>
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            ถัดไป
          </button>
        </div>
      </div>


    </div>
  );
}
