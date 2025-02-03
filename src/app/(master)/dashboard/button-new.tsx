"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ButtonAdd() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-end mb-4 w-full">
      <Button className="w-full sm:w-fit" asChild>
        <Link href={pathname + "/add"}>
          <Plus />
          Novo
        </Link>
      </Button>
    </div>
  );
}
