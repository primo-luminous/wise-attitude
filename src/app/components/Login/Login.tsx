"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { signInAction } from "@/app/actions/auth";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { showError, showLoginSuccess, showLogoutSuccess, showLoading, closeLoading } from "@/lib/sweetalert";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <LogIn className="size-5" />
      {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      <span className="sr-only">Submit</span>
    </button>
  );
}

function LuxeLoginCardContent({
  error,
  backTo,
}: {
  error?: string;
  backTo: string;
}) {
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();
  const displayError = error ? decodeURIComponent(error) : "";

  // Use action state for better error handling
  const [state, formAction] = useActionState(signInAction, { 
    success: false, 
    error: null, 
    mustChangePassword: false, 
    redirectUrl: "" 
  });
  const stateError = state?.error;

  // Handle URL parameters for notifications
  useEffect(() => {
    const urlError = searchParams.get('error');
    const logoutSuccess = searchParams.get('logout');

    if (urlError) {
      showError('เกิดข้อผิดพลาด', decodeURIComponent(urlError));
    }

    if (logoutSuccess === 'success') {
      showLogoutSuccess();
    }
  }, [searchParams]);

  // Handle successful login redirect
  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state]);

  return (
    <div className="relative w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute -inset-6 rounded-[2rem]
                   bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.12),transparent_60%)]"
      />
      <motion.div
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="relative card-glass"
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/assets/images/Logo.jpg"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-lg w-auto h-auto"
            priority
          />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-sm text-zinc-300/80">
            ยินดีต้อนรับกลับ — กรุณากรอกข้อมูลของคุณ
          </p>
        </div>

        {(displayError || stateError) ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {displayError || stateError}
          </div>
        ) : null}

        {/* Form with custom action */}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="from" value={backTo ?? "/main"} />

          {/* Email */}
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-300/80">
              อีเมล
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Mail className="size-4 text-zinc-400" />
              </span>
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3
                           text-white placeholder:text-zinc-400
                           focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="you@company.com"
              />
            </div>
          </label>

          {/* Password */}
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-300/80">
              รหัสผ่าน
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="size-4 text-zinc-400" />
              </span>
              <input
                name="password"
                type={show ? "text" : "password"}
                required
                minLength={8}
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3
                           text-white placeholder:text-zinc-400
                           focus:outline-none focus:ring-2 focus:ring-white/30 pr-11"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 select-none text-zinc-300/80 cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                className="size-4 rounded border-white/10 bg-white/5 accent-white/80"
              />
              จดจำฉัน
            </label>
            <a
              className="text-zinc-200/90 underline-offset-4 hover:underline"
              href="/forgot-password"
            >
              ลืมรหัสผ่าน?
            </a>
          </div>

          <SubmitButton />
        </form>

        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[1.5rem] ring-1 ring-white/10" />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-[1px] rounded-[1.55rem]
                     bg-gradient-to-br from-white/15 via-transparent to-transparent
                     opacity-70"
        />
      </motion.div>
    </div>
  );
}

function LoginContent({
  error,
  backTo,
}: {
  error?: string;
  backTo: string;
}) {
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();
  const displayError = error ? decodeURIComponent(error) : "";

  // Use action state for better error handling
  const [state, formAction] = useActionState(signInAction, { 
    success: false, 
    error: null, 
    mustChangePassword: false, 
    redirectUrl: "" 
  });
  const stateError = state?.error;

  // Handle URL parameters for notifications
  useEffect(() => {
    const urlError = searchParams.get('error');
    const logoutSuccess = searchParams.get('logout');

    if (urlError) {
      showError('เกิดข้อผิดพลาด', decodeURIComponent(urlError));
    }

    if (logoutSuccess === 'success') {
      showLogoutSuccess();
    }
  }, [searchParams]);

  // Handle successful login redirect
  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Background gradient overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[1px] rounded-[1.55rem]
                       bg-gradient-to-br from-white/15 via-transparent to-transparent
                       opacity-70"
          />
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
            <p className="text-gray-600 mt-2">ยินดีต้อนรับสู่ระบบจัดการทรัพย์สิน</p>
          </div>

          {/* Error message */}
          {(displayError || stateError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{displayError || stateError}</p>
              </div>
            </div>
          )}

          {/* Login form */}
          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShow(!show)}
                >
                  {show ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  จดจำการเข้าสู่ระบบ
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  ลืมรหัสผ่าน?
                </a>
              </div>
            </div>

            <div>
              <SubmitButton />
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ยังไม่มีบัญชี?{" "}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                สมัครสมาชิก
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LuxeLoginCard({
  error,
  backTo,
}: {
  error?: string;
  backTo: string;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LuxeLoginCardContent error={error} backTo={backTo} />
    </Suspense>
  );
}


