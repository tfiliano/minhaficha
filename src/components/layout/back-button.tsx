"use client";

import { useRouter } from "@/hooks/use-router";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

export function BackButton() {
  const params = useSearchParams();
  const router = useRouter();

  if (params.size === 0) return <></>;

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
