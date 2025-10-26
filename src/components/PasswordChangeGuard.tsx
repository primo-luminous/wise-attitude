"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';

interface PasswordChangeGuardProps {
  children: React.ReactNode;
}

export default function PasswordChangeGuard({ children }: PasswordChangeGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const user = await getCurrentUser();
        
        if (user && user.mustChangePassword) {
          // ตรวจสอบว่าอยู่ในหน้า change-password อยู่แล้วหรือไม่
          if (window.location.pathname !== '/main/change-password') {
            router.push('/main/change-password?force=true');
          }
        }
      } catch (error) {
        console.error('Error checking password status:', error);
      }
    };

    checkPasswordStatus();
  }, [router]);

  return <>{children}</>;
}
