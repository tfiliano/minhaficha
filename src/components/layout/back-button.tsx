"use client";

import { useRouter } from "@/hooks/use-router";
import { ChevronLeft } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

export function BackButton() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Mostrar botão voltar se:
  // - Tiver query params, OU
  // - Estiver em /admin, OU
  // - Estiver em /ficha-tecnica, OU
  // - Pathname tiver mais de 2 segmentos (rotas dinâmicas como /ficha-tecnica/[id])
  const pathSegments = pathname.split("/").filter(Boolean);
  const shouldShow = params.size > 0 || pathname.includes("/admin") || pathname === "/ficha-tecnica" || pathSegments.length > 1;

  if (!shouldShow) return <></>;

  const handleBack = () => {
    if (pathname === "/admin") router.replace("/home");
    else if (pathname === "/ficha-tecnica") router.replace("/operador");
    else router.back();
  };

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={handleBack}
    >
      <ChevronLeft />
    </Button>
  );
}
