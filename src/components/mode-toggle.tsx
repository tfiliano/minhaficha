"use client";

import { Check, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { logout } from "@/app/(auth)/auth/server-action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/hooks/use-router";
import { generateToastPromise } from "@/lib/toast";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const onLogout = async () => {
    try {
      await generateToastPromise<Awaited<ReturnType<typeof logout>>, {}>({
        action: logout,
        actionData: {},
        successMessage: "Saida com sucesso!",
        loadingMessage: "Saindo...",
      });
      router.replace("/");
    } catch (error) {}
  };

  return (
    <>
      <Button variant="outline" size="icon" onClick={onLogout}>
        <LogOut className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        <span className="sr-only">Sair</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="gap-2" onClick={() => setTheme("light")}>
            {theme === "light" && <Check size={14} />}
            Claro
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={() => setTheme("dark")}>
            {theme === "dark" && <Check size={14} />}
            Escuro
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => setTheme("system")}
          >
            {theme === "system" && <Check size={14} />}
            Sistema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
