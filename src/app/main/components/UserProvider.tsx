"use client";

import { createContext, useContext, useEffect, useState } from 'react';

type UserData = {
  id: number;
  employeeID: string;
  name: string | null;
  nickname: string | null;
  email: string;
  imageUrl: string | null;
  department: string;
  position: string;
  mustChangePassword: boolean;
  titlePrefix: string | null;
  ppPhone: string | null;
  wPhone: string | null;
  birthday: string | null;
  departmentId: number | null;
  positionId: number | null;
  // ฟิลด์ใหม่ตาม model Employee
  address: string | null;
  dayOff: string | null;
  educationLevel: string | null;
  university: string | null;
  major: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  socialSecurityStart: string | null;
};

type UserContextType = {
  user: UserData | null;
  loading: boolean;
  refetch: () => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('UserProvider - Fetched user data:', data.user);
        setUser(data.user);
      } else {
        console.log('UserProvider - No valid session');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetch = () => {
    fetchUser();
  };

  const logout = async () => {
    try {
      // ลบ session จากฐานข้อมูล
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      
      if (response.ok) {
        // ลบ user state
        setUser(null);
        
        // ลบ cookie ในฝั่ง client ด้วย (เพื่อความแน่ใจ)
        document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect ไปหน้า login
        window.location.href = '/auth/login?logout=success';
      } else {
        console.error('Logout failed:', response.status);
        // แม้จะ fail ก็ให้ลบ user state และ redirect
        setUser(null);
        window.location.href = '/auth/login?error=' + encodeURIComponent('เกิดข้อผิดพลาดในการออกจากระบบ');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // แม้จะเกิด error ก็ให้ลบ user state และ redirect
      setUser(null);
      window.location.href = '/auth/login?error=' + encodeURIComponent('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, refetch, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
