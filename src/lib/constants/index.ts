// Application constants

export const APP_CONFIG = {
  name: 'Wise Attitude',
  version: '1.0.0',
  description: 'Asset Management System',
  company: 'Wise Attitude Co., Ltd.',
} as const;

export const ROUTES = {
  // Auth routes
  LOGIN: '/auth/login',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/main/change-password',
  
  // Main routes
  DASHBOARD: '/main',
  ANALYTICS: '/main/analytics',
  CALENDAR: '/main/calendar',
  DOCUMENTS: '/main/documents',
  
  // People routes
  EMPLOYEES: '/main/employees',
  DEPARTMENTS: '/main/departments',
  POSITIONS: '/main/positions',
  
  // Asset routes
  ASSET_CATEGORIES: '/main/assetscategory',
  ASSETS: '/main/assets',
  SUPPLIERS: '/main/suppliers',
  
  // Loan routes
  LOANS: '/main/loans',
  NEW_LOAN: '/main/loans/new',
  LOAN_DETAIL: (id: number) => `/main/loans/${id}`,
  
  // Settings routes
  SETTINGS: '/main/settings',
  PROFILE: '/main/profile',
} as const;

export const LOAN_STATUS = {
  OPEN: 'OPEN',
  USE: 'USE',
  CLOSED: 'CLOSED',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const;

export const LOAN_STATUS_LABELS = {
  [LOAN_STATUS.OPEN]: 'เปิดใช้งาน',
  [LOAN_STATUS.USE]: 'กำลังใช้งาน',
  [LOAN_STATUS.CLOSED]: 'ปิดการยืม',
  [LOAN_STATUS.OVERDUE]: 'เกินกำหนด',
  [LOAN_STATUS.CANCELLED]: 'ยกเลิก',
} as const;

export const LOAN_STATUS_COLORS = {
  [LOAN_STATUS.OPEN]: 'text-blue-600',
  [LOAN_STATUS.USE]: 'text-purple-600',
  [LOAN_STATUS.CLOSED]: 'text-green-600',
  [LOAN_STATUS.OVERDUE]: 'text-red-600',
  [LOAN_STATUS.CANCELLED]: 'text-gray-600',
} as const;

export const ASSET_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOST: 'LOST',
  BROKEN: 'BROKEN',
} as const;

export const ASSET_STATUS_LABELS = {
  [ASSET_STATUS.ACTIVE]: 'ใช้งานได้',
  [ASSET_STATUS.INACTIVE]: 'ไม่ใช้งาน',
  [ASSET_STATUS.LOST]: 'สูญหาย',
  [ASSET_STATUS.BROKEN]: 'ชำรุด',
} as const;

export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const EMPLOYEE_STATUS_LABELS = {
  [EMPLOYEE_STATUS.ACTIVE]: 'ใช้งาน',
  [EMPLOYEE_STATUS.INACTIVE]: 'ไม่ใช้งาน',
} as const;

export const NOTIFICATION_TYPES = {
  LOAN_CREATED: 'LOAN_CREATED',
  LOAN_RETURNED: 'LOAN_RETURNED',
  LOAN_OVERDUE: 'LOAN_OVERDUE',
  LOAN_STATUS_CHANGED: 'LOAN_STATUS_CHANGED',
  ASSET_ADDED: 'ASSET_ADDED',
  ASSET_UPDATED: 'ASSET_UPDATED',
  SYSTEM: 'SYSTEM',
} as const;

export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.LOAN_CREATED]: '📋',
  [NOTIFICATION_TYPES.LOAN_RETURNED]: '✅',
  [NOTIFICATION_TYPES.LOAN_OVERDUE]: '⚠️',
  [NOTIFICATION_TYPES.LOAN_STATUS_CHANGED]: '🔄',
  [NOTIFICATION_TYPES.ASSET_ADDED]: '📦',
  [NOTIFICATION_TYPES.ASSET_UPDATED]: '🔄',
  [NOTIFICATION_TYPES.SYSTEM]: '🔔',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

export const SESSION = {
  DEFAULT_EXPIRY_HOURS: 1,
  REMEMBER_ME_EXPIRY_DAYS: 30,
  REFRESH_THRESHOLD_MINUTES: 5,
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;
