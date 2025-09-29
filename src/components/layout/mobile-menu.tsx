"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StoreSelector } from "../store-selector";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 sm:w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Menu className="h-4 w-4 text-white" />
            </div>
            Menu
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Loja</p>
            <StoreSelector />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}