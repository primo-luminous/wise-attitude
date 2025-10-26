"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { showUniqueAlert, closeAll } from "@/lib/sweetalert";

interface SessionStatus {
  status: "active" | "expired" | "kicked_out" | "error";
  message: string;
  otherDevice?: {
    userAgent: string;
    ipAddress: string;
    lastActivity: string;
  };
}

export default function SessionMonitor() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const [hasShownExpiryWarning, setHasShownExpiryWarning] = useState(false);
  const isRedirecting = useRef(false);

  const checkSessionStatus = async () => {
    // ป้องกันการเรียกซ้ำถ้ากำลัง redirect อยู่
    if (isRedirecting.current || isChecking) {
      return;
    }

    try {
      setIsChecking(true);
      const response = await fetch("/api/auth/session-status");
      const data: SessionStatus = await response.json();

      if (response.status === 401) {
        // Session หมดอายุ - แสดง warning เพียงครั้งเดียว
        if (!hasShownWarning) {
          setHasShownWarning(true);
          isRedirecting.current = true;
          
          await showUniqueAlert({
            title: "Session หมดอายุ",
            text: data.message,
            icon: "warning",
            confirmButtonText: "เข้าสู่ระบบใหม่",
            allowOutsideClick: false
          });
          
          router.push("/auth/login");
        }
        return;
      }

      // ไม่มีการตรวจสอบ kicked_out - อนุญาตให้ login ได้หลายเครื่อง
      // if (response.status === 403) {
      //   // ถูก kick out - แสดง warning เพียงครั้งเดียว
      //   if (!hasShownWarning) {
      //     setHasShownWarning(true);
      //     isRedirecting.current = true;
      //     
      //     await showUniqueAlert({
      //       title: "มีการเข้าสู่ระบบจากที่อื่น",
      //       text: "บัญชีของคุณถูกออกจากระบบ",
      //       icon: "error",
      //       confirmButtonText: "เข้าใจแล้ว",
      //       allowOutsideClick: false
      //     });
      //     
      //     router.push("/auth/login");
      //   }
      //   return;
      // }

      if (response.status === 500) {
        // เกิดข้อผิดพลาด
        console.error("Session check error:", data.message);
      }

      // Reset warning flags ถ้า session ปกติ
      if (response.ok && data.status === "active") {
        setHasShownWarning(false);
        setHasShownExpiryWarning(false);
      }

    } catch (error) {
      console.error("Session check failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const refreshSession = async () => {
    try {
      const response = await fetch("/api/auth/refresh-session", {
        method: "POST"
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Session refreshed:", data.message);
        
        // แสดง notification ว่า session ถูก refresh แล้ว
        showUniqueAlert({
          title: "Session ถูก Refresh แล้ว",
          text: "Session ของคุณถูกขยายเวลาอีก 1 ชั่วโมง",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
        
        // Reset expiry warning flag
        setHasShownExpiryWarning(false);
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  };

  // ตรวจสอบ session ทุก 2 นาที (เพิ่มจาก 30 วินาที)
  useEffect(() => {
    const interval = setInterval(checkSessionStatus, 2 * 60 * 1000);
    
    // ตรวจสอบครั้งแรกหลังจาก delay เล็กน้อย
    const initialCheck = setTimeout(checkSessionStatus, 2000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(initialCheck);
    };
  }, []);

  // ตรวจสอบเมื่อมีการ focus กลับมาที่หน้าต่าง (ลดความถี่)
  useEffect(() => {
    let focusTimeout: NodeJS.Timeout;
    
    const handleFocus = () => {
      // ใช้ debounce เพื่อป้องกันการเรียกซ้ำ
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        if (!isRedirecting.current) {
          checkSessionStatus();
        }
      }, 2000); // เพิ่มจาก 1 วินาทีเป็น 2 วินาที
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearTimeout(focusTimeout);
    };
  }, []);

  // ตรวจสอบเมื่อมีการ visibility change (ลดความถี่)
  useEffect(() => {
    let visibilityTimeout: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      if (!document.hidden && !isRedirecting.current) {
        // ใช้ debounce เพื่อป้องกันการเรียกซ้ำ
        clearTimeout(visibilityTimeout);
        visibilityTimeout = setTimeout(checkSessionStatus, 2000); // เพิ่มจาก 1 วินาทีเป็น 2 วินาที
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(visibilityTimeout);
    };
  }, []);

  // ตรวจสอบ session ที่ใกล้หมดอายุและแสดง warning (ลดความถี่)
  useEffect(() => {
    const checkExpiryWarning = async () => {
      // ป้องกันการแสดง warning ซ้ำ
      if (hasShownExpiryWarning || isRedirecting.current) {
        return;
      }

      try {
        const response = await fetch("/api/auth/session-status");
        if (response.ok) {
          const data = await response.json();
          
          // ถ้า session ใกล้หมดอายุ (เหลือน้อยกว่า 5 นาที) แสดง warning
          if (data.status === "active") {
            // ตรวจสอบเวลาที่เหลือจาก cookie
            const cookies = document.cookie.split(';');
            const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session_token='));
            
            if (sessionCookie) {
              // แสดง warning และให้เลือก refresh หรือไม่
              setHasShownExpiryWarning(true);
              
              const result = await showUniqueAlert({
                title: "Session ใกล้หมดอายุ",
                text: "Session ของคุณจะหมดอายุในไม่ช้า ต้องการขยายเวลาหรือไม่?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "ขยายเวลา",
                cancelButtonText: "ไม่",
                timer: 30000,
                timerProgressBar: true
              });
              
              if (result.isConfirmed) {
                await refreshSession();
              }
            }
          }
        }
      } catch (error) {
        console.error("Expiry warning check failed:", error);
      }
    };

    // ตรวจสอบทุก 15 นาที (เพิ่มจาก 10 นาที)
    const interval = setInterval(checkExpiryWarning, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [hasShownExpiryWarning]);

  // Cleanup เมื่อ component unmount
  useEffect(() => {
    return () => {
      // ปิด SweetAlert ทั้งหมดเมื่อ component unmount
      closeAll();
    };
  }, []);

  return null; // Component นี้ไม่แสดงผล UI
}
