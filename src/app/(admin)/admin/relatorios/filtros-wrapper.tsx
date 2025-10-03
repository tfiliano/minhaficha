"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { useFilters } from "@/hooks/use-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";

interface FiltrosWrapperProps {
  grupos: Array<{ id: string; nome: string }> | null;
  produtosPai: Array<{ id: string; nome: string }> | null;
  armazenamentos: Array<{ id: string; armazenamento: string }> | null;
  setores: Array<{ id: string; nome: string }> | null;
  floating?: boolean;
}

// Função auxiliar para calcular períodos
function getDateRange(periodo: string): DateRange | undefined {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  switch (periodo) {
    case "hoje":
      return { from: startOfToday, to: startOfToday };

    case "esta-semana": {
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Segunda-feira
      const monday = new Date(today);
      monday.setDate(today.getDate() - diff);
      monday.setHours(0, 0, 0, 0);
      return { from: monday, to: startOfToday };
    }

    case "mes-atual": {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: firstDay, to: startOfToday };
    }

    case "mes-passado": {
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: firstDayLastMonth, to: lastDayLastMonth };
    }

    case "ano-todo": {
      const firstDayYear = new Date(today.getFullYear(), 0, 1);
      return { from: firstDayYear, to: startOfToday };
    }

    default:
      return undefined;
  }
}

export function FiltrosWrapper({
  grupos = [],
  produtosPai = [],
  armazenamentos = [],
  setores = [],
  floating = false,
}: FiltrosWrapperProps) {
  const router = useRouter();
  const [periodoPreset, setPeriodoPreset] = useState<string>("mes-atual");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    getDateRange("mes-atual")
  );

  const {
    filters: filtros,
    updateFilter,
    clearFilters,
    activeFiltersCount,
  } = useFilters({
    periodo: "mes-atual",
    grupo: "all",
    produtoPai: "all",
    armazenamento: "all",
    setor: "all",
    itemCardapio: "all",
    tipoRelatorio: "producao",
  });

  // Aplicar filtro do mês atual automaticamente na primeira renderização
  useEffect(() => {
    // Verificar se já tem parâmetros na URL
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (!searchParams.has('dataInicio') && !searchParams.has('dataFim')) {
        const range = getDateRange("mes-atual");
        if (range?.from && range?.to) {
          const params = new URLSearchParams();
          params.set("dataInicio", range.from.toISOString());
          params.set("dataFim", range.to.toISOString());
          router.push(`/admin/relatorios?${params.toString()}`);
        }
      }
    }
  }, []); // Executa apenas uma vez no mount

  const handlePeriodoChange = (periodo: string) => {
    setPeriodoPreset(periodo);
    const range = getDateRange(periodo);
    setDateRange(range);
  };

  const handleApplyFilters = () => {
    // Construir query params
    const params = new URLSearchParams();

    if (dateRange?.from) {
      params.set("dataInicio", dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      params.set("dataFim", dateRange.to.toISOString());
    }
    if (filtros.grupo !== "all") {
      params.set("grupo", filtros.grupo);
    }
    if (filtros.produtoPai !== "all") {
      params.set("produtoPai", filtros.produtoPai);
    }
    if (filtros.armazenamento !== "all") {
      params.set("armazenamento", filtros.armazenamento);
    }
    if (filtros.setor !== "all") {
      params.set("setor", filtros.setor);
    }
    if (filtros.itemCardapio !== "all") {
      params.set("itemCardapio", filtros.itemCardapio);
    }

    // Recarregar a página com os filtros
    router.push(`/admin/relatorios?${params.toString()}`);
  };

  const handleClearFilters = () => {
    clearFilters();
    setDateRange(undefined);
    router.push("/admin/relatorios");
  };

  const filterButton = floating ? (
    <Button
      variant="outline"
      size="icon"
      className="h-12 w-12 rounded-lg shadow-md hover:shadow-lg transition-all border-2 bg-background"
    >
      <Filter className="h-5 w-5" />
      {activeFiltersCount > 0 && (
        <Badge
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600 hover:bg-blue-600"
        >
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  ) : undefined;

  return (
    <div className={floating ? "fixed right-6 top-1/2 -translate-y-1/2 z-50" : "flex gap-2"}>
      <FilterSheet
        activeFiltersCount={activeFiltersCount}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        trigger={filterButton}
      >
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-300">
              Período Rápido
            </label>
            <Select value={periodoPreset} onValueChange={handlePeriodoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="esta-semana">Esta Semana</SelectItem>
                <SelectItem value="mes-atual">Mês Atual</SelectItem>
                <SelectItem value="mes-passado">Mês Passado</SelectItem>
                <SelectItem value="ano-todo">Ano Todo</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {periodoPreset === "personalizado" && (
            <div>
              <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-300">
                Período Personalizado
              </label>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-300">
              Grupo de Produtos
            </label>
            <Select value={filtros.grupo} onValueChange={(v) => updateFilter("grupo", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os grupos</SelectItem>
                {grupos.map((grupo) => (
                  <SelectItem key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-300">
              Produto Pai (Originado de)
            </label>
            <Select
              value={filtros.produtoPai}
              onValueChange={(v) => updateFilter("produtoPai", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os produtos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {produtosPai.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id}>
                    {produto.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-300">
              Local de Armazenamento
            </label>
            <Select
              value={filtros.armazenamento}
              onValueChange={(v) => updateFilter("armazenamento", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os locais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os locais</SelectItem>
                {armazenamentos.map((local) => (
                  <SelectItem key={local.id} value={local.id}>
                    {local.armazenamento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-300">
              Setor
            </label>
            <Select
              value={filtros.setor}
              onValueChange={(v) => updateFilter("setor", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os setores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os setores</SelectItem>
                {setores.map((setor) => (
                  <SelectItem key={setor.id} value={setor.nome}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-300">
              Item de Cardápio
            </label>
            <div className="flex items-center gap-4 h-10">
              <div className="flex items-center gap-2">
                <Switch
                  checked={filtros.itemCardapio === "true"}
                  onCheckedChange={(checked) =>
                    updateFilter("itemCardapio", checked ? "true" : "all")
                  }
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {filtros.itemCardapio === "true"
                    ? "Somente itens de cardápio"
                    : "Todos os produtos"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </FilterSheet>
    </div>
  );
}
