import { PropsWithChildren } from "react";
import { Navbar } from "@/components/marketing/navbar";

export default function MarketingLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Minha Ficha. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
