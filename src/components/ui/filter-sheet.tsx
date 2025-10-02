"use client";

import { ReactNode, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface FilterSheetProps {
  children: ReactNode;
  onApply: () => void;
  onClear: () => void;
  activeFiltersCount: number;
  trigger?: ReactNode;
}

export function FilterSheet({
  children,
  onApply,
  onClear,
  activeFiltersCount,
  trigger,
}: FilterSheetProps) {
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onApply();
    setOpen(false);
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" className="relative gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge
                variant="default"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
          <SheetDescription>
            Refine sua busca aplicando filtros personalizados
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="space-y-4 py-4">
            {children}
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1"
          >
            <Filter className="h-4 w-4 mr-2" />
            Aplicar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
