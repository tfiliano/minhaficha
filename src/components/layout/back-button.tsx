"use client";

import { useRouter } from "@/hooks/use-router";
import { ChevronLeft } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

export function BackButton() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  if (params.size === 0 && !pathname.includes("/admin")) return <></>;

  const handleBack = () => {
    if (pathname === "/admin") router.replace("/");
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
