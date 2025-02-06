"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export function ButtonAdd({
  addPath,
}: PropsWithChildren<{ addPath?: string }>) {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-end mb-4 w-full">
      <Button className="w-full sm:w-fit" asChild>
        <Link href={pathname + `${addPath ?? "/add"} `}>
          <Plus />
          Novo
        </Link>
      </Button>
    </div>
  );
}
