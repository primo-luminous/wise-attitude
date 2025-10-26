"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Save, KeyRound, ArrowLeft, AlertTriangle } from "lucide-react";
import { changePassword } from "@/app/actions/profile";
import { showSuccess, showError, showLoading, closeLoading } from "@/lib/sweetalert";
import Link from "next/link";

export default function ChangePasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForced, setIsForced] = useState(false);
  
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const force = searchParams.get('force');
    if (force === 'true') {
      setIsForced(true);
    }
  }, [searchParams]);

  const handlePasswordSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    showLoading('กำลังเปลี่ยนรหัสผ่าน...');
    
    try {
      const result = await changePassword(formData);
      
      if (result?.ok && result?.redirect) {
        // ลบ cache ใน client-side
        if (typeof window !== 'undefined') {
          // ลบ localStorage
          localStorage.clear();
          // ลบ sessionStorage
          sessionStorage.clear();
          // ลบ cache
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                caches.delete(name);
              });
            });
          }
        }
        
        // Redirect ไปหน้า login
        window.location.href = "http://localhost:3000/auth/login";
      } else {
        closeLoading();
        showError('เกิดข้อผิดพลาด', result?.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง');
        setIsSubmitting(false);
      }
    } catch (error) {
      closeLoading();
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold text-black">เปลี่ยนรหัสผ่าน</h1>
        {!isForced && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <Link
              href="/main/profile"
              className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับไปหน้าโปรไฟล์
            </Link>
          </div>
        )}
      </div>

      {/* Force Change Password Alert */}
      {isForced && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">ต้องเปลี่ยนรหัสผ่าน</h3>
            <p className="text-sm text-amber-700 mt-1">
              คุณต้องเปลี่ยนรหัสผ่านก่อนจึงจะสามารถใช้งานระบบได้ กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่
            </p>
          </div>
        </div>
      )}

      {/* Change Password Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">เปลี่ยนรหัสผ่าน</h2>
            <p className="text-sm text-gray-600">กรุณากรอกข้อมูลให้ครบถ้วน</p>
          </div>
        </div>

        <form data-form="password" action={handlePasswordSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่านปัจจุบัน
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                placeholder="รหัสผ่านปัจจุบัน"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่านใหม่
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                minLength={8}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                placeholder="รหัสผ่านใหม่ (ขั้นต่ำ 8 ตัวอักษร)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร และควรมีตัวอักษร ตัวเลข และสัญลักษณ์
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ยืนยันรหัสผ่านใหม่
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                placeholder="ยืนยันรหัสผ่านใหม่"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </div>

          {/* Security Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">เคล็ดลับความปลอดภัย:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• ใช้รหัสผ่านที่แตกต่างกันสำหรับแต่ละบัญชี</li>
              <li>• หลีกเลี่ยงการใช้ข้อมูลส่วนตัว เช่น วันเกิด หรือชื่อ</li>
              <li>• เปลี่ยนรหัสผ่านเป็นประจำ</li>
              <li>• ไม่แชร์รหัสผ่านกับผู้อื่น</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}
