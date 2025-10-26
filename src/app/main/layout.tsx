import { redirect } from "next/navigation";
import { getCurrentUser } from "../actions/auth";
import MainLayoutClient from "@/components/layout/MainLayoutClient";
import PasswordChangeGuard from "@/components/PasswordChangeGuard";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ตรวจสอบ authentication
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login?error=" + encodeURIComponent("กรุณาเข้าสู่ระบบใหม่"));
  }

  return (
    <PasswordChangeGuard>
      <MainLayoutClient>{children}</MainLayoutClient>
    </PasswordChangeGuard>
  );
}
