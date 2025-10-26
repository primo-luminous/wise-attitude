import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
  animated?: boolean;
}

export function Skeleton({ 
  className, 
  width, 
  height, 
  rounded = "md",
  animated = true 
}: SkeletonProps) {
  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full"
  };

  const animationClass = animated ? "animate-pulse" : "";

  return (
    <div
      className={cn(
        "bg-gray-200 dark:bg-gray-700",
        roundedClasses[rounded],
        animationClass,
        className
      )}
      style={{
        width: width,
        height: height
      }}
    />
  );
}

// Predefined skeleton components
export function SkeletonText({ 
  lines = 1, 
  className = "" 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          height="16px" 
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ 
  size = "md", 
  className = "" 
}: { 
  size?: "sm" | "md" | "lg"; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <Skeleton 
      className={cn(sizeClasses[size], "rounded-full", className)} 
    />
  );
}

export function SkeletonButton({ 
  size = "md", 
  className = "" 
}: { 
  size?: "sm" | "md" | "lg"; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: "h-8 px-3",
    md: "h-10 px-4",
    lg: "h-12 px-6"
  };

  return (
    <Skeleton 
      className={cn(sizeClasses[size], "rounded-md", className)} 
    />
  );
}

export function SkeletonCard({ 
  className = "" 
}: { 
  className?: string; 
}) {
  return (
    <div className={cn("p-6 bg-white dark:bg-gray-800 rounded-lg shadow", className)}>
      <div className="space-y-4">
        <Skeleton height="24px" className="w-1/3" />
        <SkeletonText lines={3} />
        <div className="flex space-x-2">
          <SkeletonButton size="sm" />
          <SkeletonButton size="sm" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className = "" 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-3", className)}>
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
              className={cn(
                "flex-1",
                colIndex === 0 ? "w-1/4" : "w-full"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard({ className = "" }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton height="32px" className="w-1/4" />
        <Skeleton height="16px" className="w-1/2" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      
      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <SkeletonTable rows={5} columns={4} />
      </div>
    </div>
  );
}
