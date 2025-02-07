"use client";

import { useRouter } from "@/hooks/use-router";
import { ChevronLeft } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

export function BackButton() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  console.log(window.history);
  if (params.size === 0 && !pathname.includes("/admin")) return <></>;

  return (
    <Button
      size="icon"
      variant="outline"
      className="absolute left-4"
      onClick={() => router.back()}
    >
      <ChevronLeft />
    </Button>
  );
}
