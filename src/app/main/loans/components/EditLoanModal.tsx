"use client";

import React, { useState, useEffect } from "react";
import { useActionState } from "react";
import { updateLoanByForm } from "../../../actions/loans";
import { getEmployees } from "../../../actions/employees";
import { showToast } from "@/lib/sweetalert";
import { X, Save, User, Calendar, FileText } from "lucide-react";

type Employee = {
  id: number;
  name: string;
  employeeID: string;
};

type LoanData = {
  id: number;
  borrowerId: number;
  dueDate: string | null;
  note: string | null;
  status: string;
};

type EditLoanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  loanData: LoanData | null;
  onSuccess: () => void;
};

export default function EditLoanModal({ isOpen, onClose, loanData, onSuccess }: EditLoanModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  
  const [state, formAction] = useActionState(updateLoanByForm, { ok: false, error: null });

  // Load employees when modal opens
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  // Handle form submission result
  useEffect(() => {
    if (state.ok) {
      showToast("แก้ไขรายการยืมสำเร็จ", "success");
      onSuccess();
      onClose();
    } else if (state.error) {
      showToast(state.error, "error");
    }
  }, [state, onSuccess, onClose]);

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const employees = await getEmployees();
      setEmployees(employees);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  if (!isOpen || !loanData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            แก้ไขรายการยืม #{loanData.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form action={formAction} className="p-6 space-y-6">
          <input type="hidden" name="loanId" value={loanData.id} />

          {/* Borrower Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              ผู้ยืม
            </label>
            <select
              name="borrowerId"
              defaultValue={loanData.borrowerId}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoadingEmployees}
            >
              {isLoadingEmployees ? (
                <option>กำลังโหลด...</option>
              ) : (
                employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employeeID} - {emp.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              วันกำหนดคืน
            </label>
            <input
              type="date"
              name="dueDate"
              defaultValue={loanData.dueDate || ""}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              หมายเหตุ
            </label>
            <textarea
              name="note"
              defaultValue={loanData.note || ""}
              rows={3}
              placeholder="หมายเหตุเพิ่มเติม..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Status Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>สถานะปัจจุบัน:</strong> {loanData.status}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              หมายเหตุ: ไม่สามารถแก้ไขรายการยืมที่ปิดหรือยกเลิกแล้วได้
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
