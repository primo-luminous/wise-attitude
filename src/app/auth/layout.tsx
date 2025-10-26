// src/app/auth/login/layout.tsx
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ไม่มี <html> <body> อีกแล้ว
  return <>{children}</>
}
