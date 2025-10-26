"use client";

import { UserProvider } from "./main/components/UserProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LoadingProvider } from "../components/providers/LoadingProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LoadingProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </LoadingProvider>
    </LanguageProvider>
  );
}
