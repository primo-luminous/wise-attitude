'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

type Props = {
  loanId: number;
  borrowerId: number;
  dueDate: string; // 'YYYY-MM-DD' or ''
  note: string;
  employees: { id: number; name: string; employeeID: string }[];
};

export default function HeaderFormClient({ 
  loanId, 
  borrowerId, 
  dueDate, 
  note, 
  employees 
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateHeader = async (formData: FormData) => {
    const newBorrowerId = Number(formData.get('borrowerId'));
    const newDueDate = formData.get('dueDate') as string;
    const newNote = formData.get('note') as string;

    if (newBorrowerId === borrowerId && newDueDate === dueDate && newNote === note) {
      Swal.fire({ icon: 'info', title: 'ข้อมูลไม่เปลี่ยนแปลง', timer: 1000, showConfirmButton: false });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // รอให้ SweetAlert ปิดก่อน แล้วค่อย redirect
      await Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลสำเร็จ',
        timer: 1200,
        showConfirmButton: false,
      });
      
      router.push('/main/loans');
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'บันทึกข้อมูลล้มเหลว',
        text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
      <div className="mb-4 text-lg font-semibold text-gray-900">ข้อมูลหัวการยืม</div>
      
      <form action={handleUpdateHeader} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input type="hidden" name="id" value={loanId} />
        
        <label className="space-y-2 block">
          <span className="text-sm font-medium text-gray-700">ผู้ยืม</span>
          <select
            name="borrowerId"
            defaultValue={borrowerId}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            {employees.map(e => (
              <option key={e.id} value={e.id}>
                {e.employeeID} — {e.name}
              </option>
            ))}
          </select>
        </label>
        
        <label className="space-y-2 block">
          <span className="text-sm font-medium text-gray-700">วันกำหนดคืน</span>
          <input
            type="date"
            name="dueDate"
            defaultValue={dueDate}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </label>
        
        <label className="space-y-2 block">
          <span className="text-sm font-medium text-gray-700">หมายเหตุ</span>
          <input
            name="note"
            defaultValue={note}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </label>
        
        <div className="sm:col-span-3 flex justify-end gap-2">
          <button 
            type="submit" 
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </form>
    </div>
  );
}
