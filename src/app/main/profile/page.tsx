// app/main/profile/page.tsx
import { redirect } from "next/navigation";
import { getMyProfile } from "@/actions/profile";
import ProfileClient from "../components/profile/ProfileClient";

export const revalidate = 0;

export default async function ProfilePage() {
  const res = await getMyProfile();

  if (!res.ok) {
    // ถ้าไม่ล็อกอินหรือหา user ไม่เจอ
    redirect("/auth/login?error=" + encodeURIComponent(res.error ?? "กรุณาเข้าสู่ระบบ"));
  }

  if (!res.profile) {
    // Redirect if profile is missing
    redirect("/auth/login?error=" + encodeURIComponent("กรุณาเข้าสู่ระบบ"));
  }

  return <ProfileClient initialProfile={{
    ...res.profile,
    titlePrefix: res.profile.titlePrefix || undefined,
    nickname: res.profile.nickname || undefined,
    citizenID: res.profile.citizenID || undefined,
    imageUrl: res.profile.imageUrl || undefined,
    ppPhone: res.profile.ppPhone || undefined,
    wPhone: res.profile.wPhone || undefined,
    birthday: res.profile.birthday || undefined,
    departmentId: res.profile.departmentId || undefined,
    positionId: res.profile.positionId || undefined,
    address: res.profile.address || undefined,
    dayOff: res.profile.dayOff || undefined,
    educationLevel: res.profile.educationLevel || undefined,
    university: res.profile.university || undefined,
    major: res.profile.major || undefined,
    bankName: res.profile.bankName || undefined,
    bankAccountNumber: res.profile.bankAccountNumber || undefined,
    socialSecurityStart: res.profile.socialSecurityStart || undefined,
    startDate: res.profile.startDate || undefined
  }} />;
}
