"use client";

import { useLoading } from "../providers/LoadingProvider";
import { Skeleton } from "./Skeleton";

export function GlobalLoading() {
  const { loadingState } = useLoading();

  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-4">
          {/* Loading Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {loadingState.loadingText}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              กรุณารอสักครู่...
            </p>
          </div>
          
          {/* Progress Bar */}
          {loadingState.progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>
          )}
          
          {/* Loading Dots Animation */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1s"
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component สำหรับแสดง loading ในส่วนต่างๆ ของหน้า
export function SectionLoading({ 
  text = "กำลังโหลดข้อมูล...",
  className = "" 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 space-y-4 ${className}`}>
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
    </div>
  );
}

// Component สำหรับแสดง loading ในตาราง
export function TableLoading({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="20px" className="flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              height="16px" 
              className={colIndex === 0 ? "w-1/4" : "flex-1"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Component สำหรับแสดง loading ใน card
export function CardLoading({ 
  showAvatar = true,
  showActions = true 
}: { 
  showAvatar?: boolean;
  showActions?: boolean;
}) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4">
      <div className="flex items-start space-x-4">
        {showAvatar && <Skeleton className="w-12 h-12 rounded-full" />}
        <div className="flex-1 space-y-2">
          <Skeleton height="20px" className="w-1/3" />
          <Skeleton height="16px" className="w-full" />
          <Skeleton height="16px" className="w-2/3" />
        </div>
      </div>
      
      {showActions && (
        <div className="flex space-x-2 pt-2">
          <Skeleton height="32px" className="w-20" />
          <Skeleton height="32px" className="w-20" />
        </div>
      )}
    </div>
  );
}
