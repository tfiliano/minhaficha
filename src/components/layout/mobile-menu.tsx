"use client";

import {
  Menu,
  Home,
  Package,
  FileText,
  Printer,
  BarChart3,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  Box,
  MapPin,
  Factory,
  Tags,
  ClipboardList,
  FileBox,
  Receipt,
  LayoutTemplate,
  PrinterIcon,
  Cog,
  ChefHat,
  UtensilsCrossed,
  Tag,
  Truck,
  Shield
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const adminSubmenus = [
  { href: "/admin/produtos", label: "Produtos", icon: Box },
  { href: "/ficha-tecnica", label: "Ficha Técnica", icon: ChefHat },
  { href: "/admin/operadores", label: "Operadores", icon: Users },
  { href: "/admin/grupos", label: "Grupos", icon: Tags },
  { href: "/admin/setores", label: "Setores", icon: MapPin },
  { href: "/admin/armazenamentos", label: "Armazenamentos", icon: Package },
  { href: "/admin/fabricantes", label: "Fabricantes", icon: Factory },
  { href: "/admin/sifs", label: "SIFs", icon: FileBox },
  { href: "/admin/etiquetas", label: "Etiquetas", icon: ClipboardList },
  { href: "/admin/impressoras", label: "Impressoras", icon: PrinterIcon },
  { href: "/admin/templates/etiquetas", label: "Templates", icon: LayoutTemplate },
  { href: "/admin/impressao", label: "Fila de Impressão", icon: Printer },
  { href: "/admin/reports", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/configuracoes", label: "Configurações", icon: Cog },
];

const menuItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/operador?operacao=Produção", label: "Produção", icon: UtensilsCrossed },
  { href: "/operador?operacao=Etiquetas", label: "Gerar Etiqueta", icon: Tag },
  { href: "/operador?operacao=Entrada de Insumos", label: "Entrada de Insumos", icon: Truck },
  { href: "/ficha-tecnica", label: "Ficha Técnica", icon: ChefHat },
  { href: "/admin/reports", label: "Relatórios", icon: BarChart3 },
  {
    href: "/admin",
    label: "Administração",
    icon: Shield,
    submenus: adminSubmenus
  },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpand = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 sm:w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Menu className="h-4 w-4 text-white" />
            </div>
            Menu
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const isExpanded = expandedItems.includes(item.href);
            const hasSubmenus = item.submenus && item.submenus.length > 0;

            return (
              <div key={item.href}>
                <div className="flex items-center gap-0">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>

                  {hasSubmenus && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
                      onClick={() => toggleExpand(item.href)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                {hasSubmenus && isExpanded && (
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-border pl-2">
                    {item.submenus!.map((submenu) => {
                      const SubIcon = submenu.icon;
                      const isSubmenuActive = pathname === submenu.href || pathname?.startsWith(submenu.href + '/');

                      return (
                        <Link
                          key={submenu.href}
                          href={submenu.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                            isSubmenuActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <SubIcon className="h-4 w-4 flex-shrink-0" />
                          <span>{submenu.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}