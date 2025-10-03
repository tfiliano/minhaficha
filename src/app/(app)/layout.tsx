"use client";

import { Header } from "@/components/layout";
import { PropsWithChildren, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function LayoutApp({ children }: PropsWithChildren) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Carregar estado inicial do localStorage
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    } else {
      setIsCollapsed(false);
    }

    // Escutar mudanças no estado do sidebar
    const handleCustomEvent = () => {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    };

    window.addEventListener('sidebar-toggle', handleCustomEvent);
    return () => {
      window.removeEventListener('sidebar-toggle', handleCustomEvent);
    };
  }, []);

  return (
    <>
      <Header />
      <main className={cn(
        "h-[calc(100%-80px)] transition-all duration-300",
        !isMobile && (isCollapsed ? "md:ml-16" : "md:ml-64")
      )}>
        {children}
      </main>
    </>
  );
}
