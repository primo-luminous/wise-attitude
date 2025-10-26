"use client";

import { useEffect } from 'react';
import { initSweetAlert } from '@/lib/sweetalert';

export default function SweetAlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize SweetAlert2 with custom settings
    initSweetAlert();
  }, []);

  return <>{children}</>;
}
