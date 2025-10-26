// app/auth/login/page.tsx
import Login from '@/app/components/Login/Login'

export default function LoginPage() {
  return (
    <div className="login-page min-h-screen flex items-center justify-center p-4">
      <div className="relative z-10">
        <Login backTo="/main" />
      </div>
    </div>
  )
}
