"use client";

import { Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, FileSpreadsheet, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

export default function ProducaoV2ReportPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primeiro dia do mês atual
    to: new Date(), // Data atual
  });
  const [isPending, startTransition] = useTransition();

  const handleExportReport = async () => {
    if (!date?.from || !date?.to) {
      toast.error("Selecione um período válido");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/reports/analiticos/producao/excel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRange: {
              from: date.from?.toISOString(),
              to: date.to?.toISOString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao gerar o relatório");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `relatorio_producao_${format(date.from!, "dd-MM-yyyy")}_${format(date.to!, "dd-MM-yyyy")}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
        toast.success("Relatório exportado com sucesso!");
      } catch (error: any) {
        console.error("Erro ao exportar:", error);
        toast.error(error.message || "Erro ao exportar relatório");
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Title>Relatório de Produção</Title>
      
      <Card className="p-6 max-w-md mx-auto mt-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <FileSpreadsheet className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold">Exportar Relatório</h3>
              <p className="text-sm text-muted-foreground">
                Selecione o período e exporte os dados de produção
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="date-range">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant="outline"
                    className="group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
                  >
                    <span
                      className={cn(
                        "truncate",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "dd/MM/yyyy", {
                              locale: ptBR,
                            })}{" "}
                            -{" "}
                            {format(date.to, "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </>
                        ) : (
                          format(date.from, "dd/MM/yyyy", { locale: ptBR })
                        )
                      ) : (
                        "Selecione o período"
                      )}
                    </span>
                    <CalendarIcon
                      size={16}
                      className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    locale={ptBR}
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={handleExportReport}
              disabled={isPending || !date?.from || !date?.to}
              className="w-full flex gap-2 items-center justify-center"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Gerando relatório...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={16} />
                  Exportar Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}