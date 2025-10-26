// Common types used throughout the application

export interface User {
  id: number;
  employeeID: string;
  email: string;
  name: string;
  nickname: string;
  department: string;
  position: string;
  imageUrl: string | null;
  mustChangePassword: boolean;
  titlePrefix: string | null;
  ppPhone: string | null;
  wPhone: string | null;
  birthday: string | null;
  departmentId: number | null;
  positionId: number | null;
  address: string | null;
  dayOff: string | null;
  educationLevel: string | null;
  university: string | null;
  major: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  socialSecurityStart: string | null;
}

export interface Employee {
  id: number;
  employeeID: string;
  email: string;
  name: string;
  nickname: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  imageUrl?: string | null;
  mustChangePassword: boolean;
  titlePrefix?: string | null;
  ppPhone?: string | null;
  wPhone?: string | null;
  birthday?: string | null;
  departmentId?: number | null;
  positionId?: number | null;
  address?: string | null;
  dayOff?: string | null;
  educationLevel?: string | null;
  university?: string | null;
  major?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  socialSecurityStart?: string | null;
}

export interface Asset {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  isSerialized: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'LOST' | 'BROKEN';
  totalQty: number;
  availableQty: number;
  category?: {
    id: number;
    name: string;
  } | null;
  imageUrl?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  supplier?: string | null;
  warrantyExpiry?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface Loan {
  id: number;
  status: 'OPEN' | 'USE' | 'CLOSED' | 'OVERDUE' | 'CANCELLED';
  dueDate: string | null;
  note: string | null;
  borrower: {
    id: number;
    name: string;
    employeeID: string;
  } | null;
  items: LoanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanItem {
  id: number;
  sku: string;
  name: string;
  isSerialized: boolean;
  serialNumber?: string | null;
  quantity: number;
  startAt?: string | null;
  dueAt?: string | null;
  returnedAt?: string | null;
}

export interface Notification {
  id: string;
  type: 'LOAN_CREATED' | 'LOAN_RETURNED' | 'LOAN_OVERDUE' | 'LOAN_STATUS_CHANGED' | 'ASSET_ADDED' | 'ASSET_UPDATED' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
  readAt?: string | null;
}

export interface Department {
  id: number;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: number;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface AssetCategory {
  id: number;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form state types
export interface FormState {
  ok: boolean;
  error: string | null;
  message?: string;
}

// Navigation types
export interface NavItem {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}
