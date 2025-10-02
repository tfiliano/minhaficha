import Link from "next/link";
import { UrlObject } from "url";
import { Card, CardContent } from "../ui/card";
import {
  Package,
  QrCode,
  Printer as PrinterIcon,
  FolderTree,
  Archive,
  Building2,
  MapPin,
  Shield,
  Users,
  Printer,
  Layout,
  Settings,
  BarChart3,
  ArrowRight,
  ChefHat
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/config/menu-options";

const iconMap = {
  Package,
  QrCode,
  PrinterIcon,
  FolderTree,
  Archive,
  Building2,
  MapPin,
  Shield,
  Users,
  Printer,
  Layout,
  Settings,
  BarChart3,
  ChefHat,
} as const;

const categoryStyles = {
  primary: {
    card: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-200 shadow-blue-100",
    icon: "text-blue-100",
  },
  config: {
    card: "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-200 shadow-emerald-100",
    icon: "text-emerald-100",
  },
  system: {
    card: "bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-slate-200 shadow-slate-100",
    icon: "text-slate-100",
  },
  analytics: {
    card: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-200 shadow-purple-100",
    icon: "text-purple-100",
  },
} as const;

export function CardButton({
  title,
  url,
  icon,
  description,
  category = "primary"
}: {
  title: string;
  url: string | UrlObject;
  icon?: keyof typeof iconMap;
  description?: string;
  category?: MenuCategory;
}) {
  const IconComponent = icon ? iconMap[icon] : Package;
  const styles = categoryStyles[category];

  return (
    <Link href={url} className="group">
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl",
        "border-2 cursor-pointer h-full min-h-[140px]",
        styles.card
      )}>
        <CardContent className="p-6 flex flex-col items-start justify-between h-full relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-4 -top-4">
              <IconComponent size={80} className="rotate-12" />
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col gap-3 w-full">
            <div className="flex items-start justify-between">
              <IconComponent size={32} className={cn("flex-shrink-0", styles.icon)} />
              <ArrowRight 
                size={18} 
                className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
              />
            </div>
            
            <div>
              <h3 className="font-bold text-lg leading-tight mb-1">{title}</h3>
              {description && (
                <p className="text-white/80 text-sm leading-tight line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
