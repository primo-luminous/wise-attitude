import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to convert Prisma Decimal to number
export function convertDecimal(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  // If it's already a number, return it
  if (typeof value === 'number') {
    return value;
  }
  
  // If it's a Prisma Decimal object, convert to number
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  
  // If it's a string, try to parse as number
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}

// Utility function to safely convert any value to number
export function safeNumber(value: unknown, defaultValue: number = 0): number {
  const converted = convertDecimal(value);
  return converted !== null ? converted : defaultValue;
}

// Utility function สำหรับจัดการ loading state
export function createLoadingState<T>(
  data: T | null,
  isLoading: boolean,
  error: Error | null
) {
  return {
    data,
    isLoading,
    error,
    hasData: !isLoading && !error && data !== null,
    isEmpty: !isLoading && !error && (data === null || (Array.isArray(data) && data.length === 0))
  };
}

// Utility function สำหรับ delay
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility function สำหรับ format loading text
export function formatLoadingText(text: string, dots: number = 3): string {
  const dotCount = (dots % 4) + 1;
  return text + ".".repeat(dotCount);
}
