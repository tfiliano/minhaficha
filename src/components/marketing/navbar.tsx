"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import { getWhatsAppLink } from "@/config/contact";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Minha Ficha
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href={getWhatsAppLink("navbar")} target="_blank">
            <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              WhatsApp
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
