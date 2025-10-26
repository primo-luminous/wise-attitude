// src/lib/sweetalert.ts
"use client";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/** Initialize SweetAlert2 with custom settings */
export function initSweetAlert() {
  // ป้องกันการแสดง SweetAlert ซ้ำๆ
  Swal.mixin({
    allowOutsideClick: false,
    allowEscapeKey: false,
    stopKeydownPropagation: true,
    // ป้องกันการแสดง SweetAlert หลายตัวพร้อมกัน
    didOpen: () => {
      // ปิด SweetAlert อื่นๆ ที่อาจเปิดอยู่
      (Swal.getPopup()?.querySelector('.swal2-confirm') as HTMLElement)?.focus();
    }
  });
}

/* ---------- Helpers (class ที่ใช้ซ้ำ) ---------- */
const baseClasses = {
  popup: "swal2-custom-popup",
  title: "swal2-custom-title",
  content: "swal2-custom-content",
  confirmButton: "swal2-custom-confirm",
  cancelButton: "swal2-custom-cancel",
  toast: "swal2-custom-toast",
};

/* ---------- APIs ที่ใช้ในโปรเจ็กต์ ---------- */

export function showSuccess(message: string, title = "สำเร็จ!") {
  // ปิด SweetAlert อื่นๆ ก่อนแสดงใหม่
  Swal.close();
  
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    timer: 2000,
    showConfirmButton: false,
    allowOutsideClick: false,
    customClass: {
      popup: baseClasses.popup,
      title: baseClasses.title,
    },
  });
}

export function showError(title: string, message = "") {
  // ปิด SweetAlert อื่นๆ ก่อนแสดงใหม่
  Swal.close();
  
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    allowOutsideClick: false,
    customClass: {
      popup: baseClasses.popup,
      title: baseClasses.title,
      confirmButton: baseClasses.confirmButton,
    },
  });
}

export function showConfirm(
  title: string,
  text: string,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก"
) {
  // ปิด SweetAlert อื่นๆ ก่อนแสดงใหม่
  Swal.close();
  
  return Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    allowOutsideClick: false,
    customClass: {
      popup: baseClasses.popup,
      title: baseClasses.title,
      confirmButton: baseClasses.confirmButton,
      cancelButton: baseClasses.cancelButton,
    },
  });
}

export function showLoading(message = "กำลังโหลด...") {
  // ปิด SweetAlert อื่นๆ ก่อนแสดงใหม่
  Swal.close();
  
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    customClass: {
      popup: baseClasses.popup,
      title: baseClasses.title,
    },
  });
}

export function closeLoading() {
  // ปิด modal loading หรือ alert อะไรก็ได้ที่เปิดอยู่
  Swal.close();
}

export function showLoginSuccess(userName: string) {
  // ปิด SweetAlert อื่นๆ ก่อนแสดงใหม่
  Swal.close();
  
  return Swal.fire({
    icon: "success",
    title: "เข้าสู่ระบบสำเร็จ!",
    text: `ยินดีต้อนรับ ${userName}`,
    timer: 2000,
    showConfirmButton: false,
    allowOutsideClick: false,
    customClass: {
      popup: baseClasses.popup,
      title: baseClasses.title,
    },
  });
}

export function showLogoutSuccess() {
  // ปิด SweetAlert อื่นๆ ก่อนแสดงใหม่
  Swal.close();
  
  return Swal.fire({
    icon: "success",
    title: "ออกจากระบบสำเร็จแล้ว!",
    text: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
    timer: 2000,
    showConfirmButton: false,
    allowOutsideClick: false,
    customClass: {
      popup: baseClasses.popup,
      title: baseClasses.title,
    },
  });
}

export function showLogoutConfirm() {
  // ปิด SweetAlert อื่นๆ ก่อนแสดงใหม่
  Swal.close();
  
  return Swal.fire({
    icon: "question",
    title: "ยืนยันการออกจากระบบ",
    text: "คุณต้องการออกจากระบบหรือไม่?",
    showCancelButton: true,
    confirmButtonText: "ออกจากระบบ",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    allowOutsideClick: false,
    customClass: {
      popup: baseClasses.popup,
      title: baseClasses.title,
      confirmButton: baseClasses.confirmButton,
      cancelButton: baseClasses.cancelButton,
    },
  });
}

export function showToast(
  message: string,
  type: "success" | "error" | "warning" | "info" = "info"
) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    allowOutsideClick: false,
    customClass: { popup: baseClasses.toast },
  });

  return Toast.fire({ icon: type, title: message });
}

/** ปิด SweetAlert ทั้งหมด */
export function closeAll() {
  Swal.close();
}

/** ตรวจสอบว่า SweetAlert กำลังแสดงอยู่หรือไม่ */
export function isSweetAlertOpen() {
  return Swal.isVisible();
}

/** ป้องกันการแสดง SweetAlert ซ้ำ */
export function showUniqueAlert(options: { [key: string]: unknown }) {
  if (isSweetAlertOpen()) {
    return Promise.resolve({ isConfirmed: false, isDismissed: false });
  }
  
  return Swal.fire({
    ...options,
    allowOutsideClick: false,
  });
}
