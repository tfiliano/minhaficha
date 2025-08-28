"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
// Preservado para uso futuro em dashboard:
// import MultipleSelector, { Option } from "@/components/ui/multiselect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarIcon, 
  FileSpreadsheet, 
  Loader2, 
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Clock,
  Database,
  PieChart,
  Calendar as CalendarDays,
  Zap,
  X
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

// Preservado para uso futuro em dashboard:
// type Option = { value: string; label: string };

interface Produto {
  id: string;
  nome: string;
}

interface ReportsPageClientProps {
  produtos: Produto[];
}

export default function ReportsPageClient({
  produtos,
}: ReportsPageClientProps) {
  // Preservado para uso futuro em dashboard:
  // const items = produtos.map((item) => ({ value: item.id, label: item.nome }));
  // const [itemsProducao, setItemsProducao] = useState<Option[]>([]);
  // const [itemsCorrecao, setItemsCorrecao] = useState<Option[]>([]);
  // const [itemsMovimentacao, setItemsMovimentacao] = useState<Option[]>([]);

  const handleExportReport = async (
    endpoint: string,
    filename: string,
    dateRange?: DateRange
  ) => {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
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
      toast.success(`Relatório ${filename} baixado com sucesso!`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao exportar relatório");
    }
  };

  const QuickReportCard = ({
    title,
    description,
    icon: Icon,
    endpoint,
    filename,
    color = "blue",
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    endpoint: string;
    filename: string;
    color?: "blue" | "green" | "purple" | "amber" | "red";
  }) => {
    const [date, setDate] = useState<DateRange | undefined>({
      from: new Date(),
      to: new Date(),
    });
    const [isPending, startTransition] = useTransition();
    const [showFilters, setShowFilters] = useState(false);

    // Períodos pré-definidos
    const quickDateOptions = [
      {
        label: 'Hoje',
        icon: CalendarDays,
        getValue: () => ({
          from: startOfDay(new Date()),
          to: endOfDay(new Date()),
        }),
      },
      {
        label: 'Esta Semana',
        icon: CalendarDays,
        getValue: () => ({
          from: startOfWeek(new Date(), { locale: ptBR }),
          to: endOfWeek(new Date(), { locale: ptBR }),
        }),
      },
      {
        label: 'Este Mês',
        icon: CalendarDays,
        getValue: () => ({
          from: startOfMonth(new Date()),
          to: endOfMonth(new Date()),
        }),
      },
      {
        label: 'Últimos 7 dias',
        icon: Zap,
        getValue: () => ({
          from: startOfDay(subDays(new Date(), 6)),
          to: endOfDay(new Date()),
        }),
      },
      {
        label: 'Últimos 30 dias',
        icon: Zap,
        getValue: () => ({
          from: startOfDay(subDays(new Date(), 29)),
          to: endOfDay(new Date()),
        }),
      },
      {
        label: 'Mês Anterior',
        icon: CalendarDays,
        getValue: () => {
          const lastMonth = subMonths(new Date(), 1);
          return {
            from: startOfMonth(lastMonth),
            to: endOfMonth(lastMonth),
          };
        },
      },
    ];

    const colorClasses = {
      blue: {
        gradient: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-300 dark:border-blue-700 hover:border-blue-400",
      },
      green: {
        gradient: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-300 dark:border-emerald-700 hover:border-emerald-400",
      },
      purple: {
        gradient: "from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700",
        bg: "bg-violet-100 dark:bg-violet-900/30",
        text: "text-violet-600 dark:text-violet-400",
        border: "border-violet-300 dark:border-violet-700 hover:border-violet-400",
      },
      amber: {
        gradient: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-300 dark:border-amber-700 hover:border-amber-400",
      },
      red: {
        gradient: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-300 dark:border-red-700 hover:border-red-400",
      },
    };

    const colors = colorClasses[color];

    const hasFilters = date?.from;

    function onSubmit() {
      startTransition(async () => {
        await handleExportReport(endpoint, filename, date);
      });
    }

    return (
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2",
        colors.border
      )}>
        {/* Gradiente decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="relative pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", colors.bg)}>
                <Icon className={cn("h-5 w-5", colors.text)} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {description}
                </CardDescription>
              </div>
            </div>
            
            {hasFilters && (
              <Badge variant="secondary" className="text-xs">
                <Filter className="h-3 w-3 mr-1" />
                período selecionado
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Filtros inline colapsáveis */}
          <div className="space-y-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {showFilters ? 'Ocultar Período' : 'Configurar Período'}
              </span>
              <Badge variant="outline" className="ml-2">
                {hasFilters ? 'Configurado' : 'Padrão'}
              </Badge>
            </Button>

            {showFilters && (
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                {/* Seleção rápida de períodos */}
                <div>
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    Períodos Pré-definidos
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {quickDateOptions.map((option) => (
                      <Button
                        key={option.label}
                        variant="outline"
                        size="sm"
                        onClick={() => setDate(option.getValue())}
                        className="text-xs h-8 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <option.icon className="h-3 w-3" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Seleção personalizada */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Período Personalizado
                    </Label>
                    {hasFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDate(undefined)}
                        className="text-xs h-6 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal"
                      >
                        <span className={cn("truncate", !date && "text-muted-foreground")}>
                          {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, "dd/MM/yyyy", { locale: ptBR })}
                                {" - "}
                                {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                              </>
                            ) : (
                              format(date.from, "dd/MM/yyyy", { locale: ptBR })
                            )
                          ) : (
                            "Selecionar período..."
                          )}
                        </span>
                        <CalendarIcon size={16} className="text-muted-foreground/80" />
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
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button
              disabled={isPending}
              onClick={onSubmit}
              className={cn(
                "flex-1 bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all duration-200",
                `${colors.gradient}`
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Central de Relatórios
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Gere relatórios personalizados e analise dados de produção com filtros em tempo real
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Produtos</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {produtos.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Relatórios</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  3 tipos
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Filtros</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Inline
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Formato</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  Excel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relatórios Analíticos */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Relatórios Analíticos
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Análise de dados com filtros por período - configure e processe diretamente
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickReportCard
            title="Análise de Produção"
            description="Relatório detalhado com filtros personalizáveis por período"
            icon={TrendingUp}
            endpoint="/api/reports/analiticos/producao/excel"
            filename="analise_producao.xlsx"
            color="green"
          />

          <QuickReportCard
            title="Fator de Conversão"
            description="Análise detalhada dos fatores de conversão com histórico"
            icon={PieChart}
            endpoint="/api/reports/analiticos/fator-conversao/excel"
            filename="fator_conversao.xlsx"
            color="purple"
          />

          <QuickReportCard
            title="Entradas de Insumos"
            description="Controle completo de entradas com todos os campos detalhados"
            icon={FileSpreadsheet}
            endpoint="/api/reports/analiticos/entradas-insumos/excel"
            filename="entradas_insumos.xlsx"
            color="blue"
          />
        </div>
      </div>
    </div>
  );
}