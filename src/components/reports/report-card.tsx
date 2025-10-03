"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  valueClassName?: string;
}

export function ReportCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  valueClassName,
}: ReportCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-green-600 dark:text-green-400";
    if (trend.value < 0) return "text-red-600 dark:text-red-400";
    return "text-slate-600 dark:text-slate-400";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </CardTitle>
          {Icon && (
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={cn("text-2xl font-bold", valueClassName)}>
            {value}
          </div>

          {description && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}

          {trend && TrendIcon && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor())}>
              <TrendIcon className="h-3 w-3" />
              <span>
                {trend.value > 0 ? "+" : ""}{trend.value.toFixed(1)}%
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
