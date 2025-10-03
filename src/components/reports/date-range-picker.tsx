"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

const PRESET_RANGES = [
  {
    label: "Hoje",
    getValue: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  {
    label: "Últimos 7 dias",
    getValue: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 6);
      return { from, to };
    },
  },
  {
    label: "Últimos 30 dias",
    getValue: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 29);
      return { from, to };
    },
  },
  {
    label: "Este mês",
    getValue: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from, to };
    },
  },
  {
    label: "Mês passado",
    getValue: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from, to };
    },
  },
];

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateRange = () => {
    if (!value?.from) return "Selecione o período";
    if (!value.to) return format(value.from, "dd/MM/yyyy", { locale: ptBR });
    return `${format(value.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(value.to, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r border-slate-200 dark:border-slate-700">
            <div className="p-3 space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Atalhos
              </p>
              {PRESET_RANGES.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    onChange(preset.getValue());
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <CalendarComponent
              mode="range"
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
              locale={ptBR}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(undefined);
              setIsOpen(false);
            }}
          >
            Limpar
          </Button>
          <Button
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
