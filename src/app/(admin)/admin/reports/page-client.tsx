"use client";

import { Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, FileSpreadsheet, Printer } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

interface Produto {
  id: string;
  nome: string;
}

interface ReportsPageClientProps {
  produtos: Produto[];
}

type ReportType = "producao" | "correcao" | "movimentacao";

export default function ReportsPageClient({
  produtos,
}: ReportsPageClientProps) {
  const items = produtos.map((item) => ({ value: item.id, label: item.nome }));
  const [itemsProducao, setItemsProducao] = useState<Option[]>([]);
  const [itemsCorrecao, setItemsCorrecao] = useState<Option[]>([]);
  const [itemsMovimentacao, setItemsMovimentacao] = useState<Option[]>([]);

  const handleExportReport = async (
    endpoint: string,
    selectedItems: Option[],
    filename: string,
    dateRange?: DateRange
  ) => {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          items: selectedItems.map((item) => item.value),
          dateRange,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Falha ao gerar o relatório");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.message || "Erro ao exportar relatório");
    }
  };

  const ExportCard = ({
    title,
    description,
    icon: Icon,
    selectedItems,
    setSelectedItems,
    endpoint,
    filename,
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    selectedItems: Option[];
    setSelectedItems: (options: Option[]) => void;
    endpoint: string;
    filename: string;
  }) => {
    const [date, setDate] = useState<DateRange | undefined>({
      from: new Date(),
      to: new Date(),
    });

    return (
      <Card className="p-6 transition-colors">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Icon className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div>
            <Label>Produto pai</Label>
            <MultipleSelector
              commandProps={{ label: "Selecione produtos" }}
              value={selectedItems}
              defaultOptions={items}
              placeholder="Selecione um produto..."
              hideClearAllButton
              emptyIndicator={
                <p className="text-center text-sm">Sem produtos</p>
              }
              onChange={setSelectedItems}
            />
          </div>
          <div>
            <div>
              <div className="mb-4">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
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
                              {format(date.from, "LLL dd, y", { locale: ptBR })}{" "}
                              - {format(date.to, "LLL dd, y", { locale: ptBR })}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y", { locale: ptBR })
                          )
                        ) : (
                          "Pick a date range"
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button
              onClick={() =>
                handleExportReport(endpoint, selectedItems, filename, date)
              }
            >
              Exportar Excel
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Title>Relatórios</Title>

      <div className="flex gap-4 items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <ExportCard
            title="Produção"
            description="Exportar dados de produção"
            icon={FileSpreadsheet}
            selectedItems={itemsProducao}
            setSelectedItems={setItemsProducao}
            endpoint="/api/reports/producao/excel"
            filename="relatorio_producao.xlsx"
          />

          <ExportCard
            title="Fator de Correção"
            description="Exportar dados de fator de correção"
            icon={FileSpreadsheet}
            selectedItems={itemsCorrecao}
            setSelectedItems={setItemsCorrecao}
            endpoint="/api/reports/correcao/excel"
            filename="relatorio_correcao.xlsx"
          />

          <ExportCard
            title="Movimentação de Produtos"
            description="Exportar dados de movimentação de produtos"
            icon={FileSpreadsheet}
            selectedItems={itemsMovimentacao}
            setSelectedItems={setItemsMovimentacao}
            endpoint="/api/reports/movimentacao/excel"
            filename="relatorio_movimentacao.xlsx"
          />

          <Card className="p-6 transition-colors">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Printer className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">Impressões</h3>
                  <p className="text-sm text-muted-foreground">
                    Histórico de impressões
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/admin/impressao")}
              >
                Ver Histórico
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
