"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ButtonAdd() {
  const pathname = usePathname();

  return (
    <Button className="w-full sm:w-fit gap-2" asChild>
      <Link href={pathname + "/add"}>
        <Plus className="h-4 w-4" />
        Novo
      </Link>
    </Button>
  );
}
