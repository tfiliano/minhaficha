// Refatoração completa do dashboard de produção
// - Código reorganizado, com separação de responsabilidades
// - Nomeclaturas padronizadas, legibilidade aprimorada
// - Comentários adicionados para clareza
// - Uso consistente de funções auxiliares

"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState, useTransition } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BarChart3, CalendarIcon, Loader2, TrendingUp } from "lucide-react";

// Tipagem
interface Produto {
  id: string;
  nome: string;
}

interface ProductionDashboardProps {
  produtos: Produto[];
}

// Função utilitária para formatar valores em kg (pt-BR)
function formatKg(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
    useGrouping: false,
  }).format(value);
}

// Exporta o relatório via API
async function handleExportReport(
  endpoint: string,
  selectedItems: Option[],
  filename: string,
  dateRange?: DateRange,
  type = "dashboard"
) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        items: selectedItems.map((item) => item.value),
        dateRange,
        type,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Falha ao gerar o relatório");

    if (type === "dashboard") return await response.json();

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
}

// Componente principal
export function ProductionDashboard({ produtos }: ProductionDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedProducts, setSelectedProducts] = useState<Option[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [tableData, setTableData] = useState<any[]>([]);

  const productOptions = produtos.map((p) => ({ value: p.id, label: p.nome }));

  const totalQuantity = tableData.at(-1)?.["Quantidade"] ?? 0;
  const totalWeight = tableData.at(-1)?.["Peso"] ?? 0;
  const avgWeight = totalQuantity > 0 ? totalWeight / totalQuantity : 0;

  function fetchData(type: string = "dashboard") {
    const endpoint = "/api/reports/producao/excel";

    startTransition(async () => {
      const result = await handleExportReport(
        endpoint,
        selectedProducts,
        "relatorio_producao.xlsx",
        dateRange,
        type
      );
      if (type === "dashboard" && Array.isArray(result)) setTableData(result);
    });
  }

  useEffect(() => {
    if (selectedProducts.length) fetchData();
    else if (tableData.length) setTableData([]);
  }, [selectedProducts, dateRange]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header + Filtros */}
        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-primary to-primary/50 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Relatório de Produção
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Produto Pai
              </label>
              <MultipleSelector
                value={selectedProducts}
                defaultOptions={productOptions}
                placeholder="Selecione um produto..."
                hideClearAllButton
                commandProps={{ label: "Selecione produtos" }}
                emptyIndicator={
                  <p className="text-center text-sm">Sem produtos</p>
                }
                onChange={setSelectedProducts}
              />
            </div>

            <div className="space-y-2 hidden">
              <label className="text-sm font-medium text-muted-foreground">
                Tipo
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {["Sub-Produto", "Produto"].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Data
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="group w-full px-3 justify-between font-normal"
                  >
                    <span
                      className={cn(
                        "truncate",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy", {
                              locale: ptBR,
                            })}{" "}
                            -{" "}
                            {format(dateRange.to, "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        )
                      ) : (
                        "Selecionar intervalo"
                      )}
                    </span>
                    <CalendarIcon
                      className="text-muted-foreground/80 group-hover:text-foreground"
                      size={16}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    locale={ptBR}
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Cards de resumo */}
        {!isPending && tableData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              title="Total Quantidade"
              value={totalQuantity}
              suffix="unidades"
              iconColor="text-primary"
            />
            <SummaryCard
              title="Total Peso"
              value={formatKg(totalWeight)}
              suffix="kg"
              iconColor="text-primary-glow"
            />
            <SummaryCard
              title="Peso Médio"
              value={formatKg(avgWeight)}
              suffix="kg/unidade"
              iconColor="text-accent-foreground"
            />
          </div>
        )}

        {/* Tabela de resultados */}
        {!isPending && tableData.length > 0 && (
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                Detalhamento por Grupo
              </CardTitle>
              <Button onClick={() => fetchData("excel")}>
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Preparando...
                  </>
                ) : (
                  "Exportar Excel"
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "Grupo",
                        "Subproduto",
                        "Quantidade",
                        "Peso (kg)",
                        "Peso Médio",
                      ].map((h, i) => (
                        <th
                          key={i}
                          className={cn(
                            "py-3 px-4 text-sm font-medium text-muted-foreground",
                            i < 2 ? "text-left" : "text-right"
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="py-3 px-4 font-medium text-foreground">
                          {item.Grupo}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {item.Subproduto}
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">
                          {item.Quantidade}
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">
                          {formatKg(item.Peso)}
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">
                          {formatKg(item["Peso Médio"])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estados de vazio ou loading */}
        {!isPending && tableData.length === 0 && (
          <EmptyState
            icon={<BarChart3 />}
            title="Selecione um produto"
            description="Escolha um produto pai para visualizar os dados de produção"
          />
        )}

        {isPending && (
          <EmptyState
            icon={<Loader2 className="animate-spin" />}
            title="Processando..."
          />
        )}
      </div>
    </div>
  );
}

// Componente de card de resumo reutilizável
function SummaryCard({
  title,
  value,
  suffix,
  iconColor,
}: {
  title: string;
  value: string | number;
  suffix: string;
  iconColor: string;
}) {
  return (
    <Card
      className="dashboard-card border-l-4"
      style={{ borderColor: iconColor }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className={cn("flex items-center text-sm mt-1", iconColor)}>
          <TrendingUp className="h-4 w-4 mr-1" />
          {suffix}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para estado vazio ou carregando
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <Card className="dashboard-card text-center py-12">
      <CardContent>
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
