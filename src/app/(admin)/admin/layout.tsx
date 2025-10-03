"use client";

import { Header } from "@/components/layout";
import { PropsWithChildren, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function LayoutApp({ children }: PropsWithChildren) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Sincronizar com localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }

    // Escutar mudanças no localStorage
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Usar evento customizado para mudanças na mesma aba
    const handleCustomEvent = () => {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    };

    window.addEventListener('sidebar-toggle', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebar-toggle', handleCustomEvent);
    };
  }, []);

  return (
    <>
      <Header />
      <main
        className={cn(
          "h-[calc(100%-80px)] transition-all duration-300",
          !isMobile && (isCollapsed ? "md:ml-16" : "md:ml-64")
        )}
      >
        {children}
      </main>
    </>
  );
}
