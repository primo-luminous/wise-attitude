"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Boxes,
  Store,
  Building2,
  Briefcase,
  Network,
  ArrowRightLeft,
  ChevronDown,
  Menu,
  X,
  Home,
  Settings,
  BarChart3,
  FileText,
  Calendar
} from "lucide-react";
import { usePathname } from "next/navigation";
import { ComponentType, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

type Item = {
  href: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

type Section = {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: Item[];
};

// ย้าย matchPath ออกมาด้านนอก
function matchPath(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

// ย้าย SECTIONS ออกมาด้านนอก component
const createSections = (t: (key: string) => string): Section[] => [
  {
    id: "overview",
    title: t('overview'),
    icon: Home,
    items: [
      { href: ROUTES.DASHBOARD, title: t('dashboard'), icon: LayoutDashboard, exact: true },
      { href: ROUTES.ANALYTICS, title: t('analytics'), icon: BarChart3 },
      { href: ROUTES.CALENDAR, title: t('calendar'), icon: Calendar },
      { href: ROUTES.DOCUMENTS, title: t('documents'), icon: FileText },
    ],
  },
  {
    id: "people",
    title: t('people'),
    icon: Users,
    items: [
      { href: ROUTES.EMPLOYEES, title: t('employees'), icon: Users },
      { href: ROUTES.DEPARTMENTS, title: t('departments'), icon: Building2 },
      { href: ROUTES.POSITIONS, title: t('positions'), icon: Briefcase },
    ],
  },
  {
    id: "assets",
    title: t('assets'),
    icon: Boxes,
    items: [
      { href: ROUTES.ASSET_CATEGORIES, title: t('asset_categories'), icon: Network },
      { href: ROUTES.ASSETS, title: t('assets'), icon: Boxes },
      { href: ROUTES.SUPPLIERS, title: t('suppliers'), icon: Store },
    ],
  },
  {
    id: "loans",
    title: t('loans'),
    icon: ArrowRightLeft,
    items: [{ href: ROUTES.LOANS, title: t('loans'), icon: ArrowRightLeft }],
  },
  {
    id: "settings",
    title: t('settings'),
    icon: Settings,
    items: [
      { href: ROUTES.SETTINGS, title: t('general_settings'), icon: Settings },
    ],
  },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  // สร้าง SECTIONS ด้วย function t
  const SECTIONS = createSections(t);

  // หา section ที่มีเมนูย่อย active จาก pathname
  const activeSectionId = useMemo(() => {
    for (const s of SECTIONS) {
      if (s.items.some((it) => matchPath(pathname, it.href, it.exact))) return s.id;
    }
    return null;
  }, [SECTIONS, pathname]);

  // หา item ที่ active จาก pathname
  const activeItemHref = useMemo(() => {
    for (const s of SECTIONS) {
      for (const it of s.items) {
        if (matchPath(pathname, it.href, it.exact)) return it.href;
      }
    }
    return null;
  }, [SECTIONS, pathname]);

  // หา section ที่ expand อยู่
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // เมื่อ component mount ให้ expand section ที่ active
  useEffect(() => {
    if (activeSectionId) {
      setExpandedSections(new Set([activeSectionId]));
    }
  }, [activeSectionId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // ตรวจว่าเป็นหน้าจอ md ขึ้นไปหรือไม่ (เพื่อปิดเฉพาะมือถือ)
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsMd(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // ปิด overlay เฉพาะ "มือถือ" เท่านั้น (เดสก์ท็อปไม่ปิด -> ไม่ย่อ sidebar เอง)
  const closeIfMobile = () => {
    if (!isMd) onClose();
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen
              border-r border-white/10 bg-white/5 backdrop-blur-xl
              shadow-2xl shadow-black/20 transition-[transform,width] duration-300
              ${open ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0
              ${open ? "md:w-72" : "md:w-16"}
              md:sticky md:top-0 md:h-screen md:shrink-0`}
      >
        <div className="flex h-full flex-col">
          {/* Header with toggle button */}
          <div className={`flex items-center py-4 ${open ? "px-4 justify-between" : "justify-center"}`}>
            <div className="flex items-center">
              <Image
                src="/assets/images/Logo.jpg"
                alt="Logo Wise Attitude Talent"
                width={32}
                height={32}
                priority
                className="rounded-md"
              />
              {open && <span className="ml-3 font-semibold tracking-wide text-black">Wise Attitude</span>}
            </div>
            {open && (
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-white/10 text-black"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Accordion Navigation */}
          <nav className="px-2 py-2 space-y-2 text-sm flex-1 overflow-y-auto">
            {SECTIONS.map((section) => {
              const hasActive = section.items.some((it) => matchPath(pathname, it.href, it.exact));
              const isOpen = open && expandedSections.has(section.id); // เปิดเมนูย่อยเฉพาะตอน sidebar กว้าง
              const SectionIcon = section.icon;

              return (
                <div key={section.id} className="rounded-lg">
                  {/* หัวข้อแต่ละกลุ่ม */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    aria-label={section.title}
                    title={section.title}
                    className={`flex w-full items-center rounded-lg py-2 transition-colors
                                ${open ? "justify-between px-3" : "justify-center px-2"}
                                ${hasActive ? "bg-white text-zinc-900" : "hover:bg-white/10 text-black"}`}
                  >
                    {open ? (
                      <span className={`${hasActive ? "text-zinc-900" : "text-black"}`}>{section.title}</span>
                    ) : (
                      <SectionIcon className={`size-5 ${hasActive ? "text-zinc-900" : "text-black"}`} />
                    )}

                    {open && (
                      <ChevronDown
                        className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""} ${
                          hasActive ? "text-zinc-900" : "text-black"
                        }`}
                      />
                    )}
                  </button>

                  {/* เมนูย่อย */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-90"
                    }`}
                    aria-hidden={!isOpen}
                  >
                    <ul className="overflow-hidden pl-1.5">
                      {section.items.map((it) => (
                        <li key={it.href}>
                          <NavLinkItem
                            href={it.href}
                            title={it.title}
                            Icon={it.icon}
                            exact={it.exact}
                            onAfterNavigate={closeIfMobile} // ✅ ปิดเฉพาะมือถือ
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

/** ลิงก์เมนูย่อยพร้อม active state */
function NavLinkItem({
  href,
  title,
  Icon,
  exact = false,
  onAfterNavigate,
}: {
  href: string;
  title: string;
  Icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  onAfterNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = matchPath(pathname, href, exact);

  return (
    <Link
      href={href}
      onClick={() => onAfterNavigate?.()}
      className={`group mt-1.5 flex items-center gap-3 rounded-lg px-3 py-2 transition-colors
                  ${isActive ? "bg-white text-zinc-900" : "hover:bg-white/10 text-black"}`}
      aria-current={isActive ? "page" : undefined}
      title={title}
    >
      <Icon className={`size-5 ${isActive ? "text-zinc-900" : "text-black"}`} />
      <span className={`${isActive ? "text-zinc-900" : "text-black"}`}>{title}</span>
    </Link>
  );
}
