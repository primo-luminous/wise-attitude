'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateLoanStatusByForm } from '@/actions/loans';
import { showToast } from '@/lib/sweetalert';
import Swal from 'sweetalert2';

export default function StatusFormClient({ 
  loanId, 
  status 
}: { 
  loanId: number; 
  status: 'OPEN'|'USE'|'CLOSED'|'OVERDUE'|'CANCELLED' 
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async (formData: FormData) => {
    const newStatus = formData.get('status') as string;
    
    if (newStatus === status) {
      showToast("สถานะไม่เปลี่ยนแปลง", "warning");
      return;
    }

    setIsLoading(true);
    
    try {
      // Add loan ID to form data
      formData.append('id', loanId.toString());
      
      // Call the actual server action
      const result = await updateLoanStatusByForm({ ok: false, error: null }, formData);
      
      if (result.ok) {
        showToast("อัพเดตสถานะการยืมสำเร็จ", "success");
        // Refresh the page
        router.refresh();
      } else {
        showToast(result.error || "เกิดข้อผิดพลาดในการอัพเดตสถานะ", "error");
      }
    } catch (error) {
      showToast("เกิดข้อผิดพลาดในการอัพเดตสถานะ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLoan = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ลบการยืมนี้?',
      text: 'การดำเนินการนี้ไม่สามารถยกเลิกได้',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        Swal.fire({ 
          icon: 'success', 
          title: 'ลบการยืมสำเร็จ', 
          timer: 900, 
          showConfirmButton: false 
        });
        
        // Redirect to loans list
        router.push('/main/loans');
      } catch (error) {
        Swal.fire({ 
          icon: 'error', 
          title: 'ลบการยืมล้มเหลว', 
          text: 'เกิดข้อผิดพลาดในการลบการยืม' 
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
      <div className="mb-4 text-lg font-semibold text-gray-900">สถานะ</div>
      
      <form action={handleUpdateStatus} className="flex items-center gap-3">
        <input type="hidden" name="id" value={loanId} />
        <select 
          name="status" 
          defaultValue={status} 
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="OPEN">เปิดใช้งาน</option>
          <option value="USE">กำลังใช้งาน</option>
          <option value="CLOSED">ปิดการยืม</option>
          <option value="OVERDUE">เกินกำหนด</option>
          <option value="CANCELLED">ยกเลิก</option>
        </select>
        <button 
          type="submit" 
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'กำลังอัปเดต...' : 'อัปเดตสถานะ'}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="mb-2 font-semibold text-red-600">เขตอันตราย</div>
        <button
          onClick={handleDeleteLoan}
          disabled={isLoading}
          className="inline-flex items-center gap-2
                     text-white bg-gradient-to-br from-pink-500 to-orange-400
                     hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200
                     font-medium rounded-lg text-sm px-4 py-2 disabled:opacity-50"
        >
          {isLoading ? 'กำลังลบ...' : 'ลบการยืม'}
        </button>
      </div>
    </div>
  );
}
