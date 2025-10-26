"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Menu, User, KeyRound, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useUser } from "../../app/main/components/UserProvider";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import NotificationBell from "../ui/NotificationBell";
import { ROUTES } from "@/lib/constants";

export default function Navbar({
  onToggleSidebar,
  sidebarOpen,
}: {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, loading, logout } = useUser();
  const { language, setLanguage, t } = useLanguage();

  // Debug log
  console.log('Navbar - User data:', user);
  console.log('Navbar - Loading:', loading);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const leftClass = sidebarOpen ? "md:left-72" : "md:left-16";



  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  if (loading) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-30 border-b border-white/10 bg-white/5 backdrop-blur-xl ${leftClass}`}>
        <div className="flex h-16 items-center justify-between px-4">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 border-b border-white/10 bg-white/5 backdrop-blur-xl ${leftClass}`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <button
          onClick={onToggleSidebar}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 hover:bg-white/15 text-black"
          aria-label="Toggle sidebar"
        >
          <Menu className="size-5" />
          <span className="hidden sm:inline">{t('menu')}</span>
        </button>

        {/* Right side - Language, Notifications and Account */}
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-400 to-pink-600 group-hover:from-purple-400 group-hover:to-pink-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
            title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
          >
            <span className="relative px-3 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent flex items-center gap-2">
              <Globe className="size-4" />
              <span className="font-bold">{language.toUpperCase()}</span>
            </span>
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Account menu */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((s) => !s)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1.5 hover:bg-white/15 text-black"
              aria-label={t('account')}
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-white/10">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.name ?? user.email}
                    fill
                    sizes="32px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <User className="size-5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80" />
                )}
              </div>
              <ChevronDown className="size-4" />
              <span className="sr-only">{t('account')}</span>
            </button>

            {open && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white text-black shadow-xl p-2"
                role="menu"
                aria-label={t('account')}
              >
                {/* แสดงชื่อบนหัวเมนู */}
                {user && (
                  <div className="px-3 py-2 text-sm font-medium border-b border-gray-100">
                    <div className="font-semibold text-gray-900">
                      {user.nickname || user.name || user.email}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user.department && user.position ? `${user.department} - ${user.position}` : user.email}
                    </div>
                  </div>
                )}

                <Link
                  href={ROUTES.PROFILE}
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                >
                  <User className="size-4 text-gray-700" />
                  <span>{t('my_profile')}</span>
                </Link>

                <Link
                  href={ROUTES.CHANGE_PASSWORD}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                >
                  <KeyRound className="size-4 text-gray-700" />
                  <span>{t('change_password')}</span>
                </Link>

                {/* เพิ่มเส้นแบ่งที่สวยงาม */}
                <hr className="my-2 border-gray-200" />

                <button
                  onClick={handleLogout}
                  className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
                >
                  <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent flex items-center gap-2">
                    <LogOut className="size-4" />
                    {t('sign_out')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
