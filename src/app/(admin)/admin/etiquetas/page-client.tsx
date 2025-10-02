"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tables } from "@/types/database.types";
import {
  Search,
  Package,
  Calendar,
  Hash,
  Layers,
  Filter,
  Building2,
  Tag,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Eye,
  Edit,
  Plus
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { useFilters } from "@/hooks/use-filters";

type Etiqueta = Tables<`etiquetas`>;
type ViewMode = "grid" | "list";
type SortField = "validade" | "lote" | "created_at";
type SortOrder = "asc" | "desc";

type EtiquetasPage = {
  etiquetas: Etiqueta[] | null;
};

export function EtiquetasPageClient({
  etiquetas,
}: PropsWithChildren<EtiquetasPage>) {
  const pathname = usePathname();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const {
    filters: filtros,
    updateFilter,
    clearFilters,
    activeFiltersCount
  } = useFilters({
    busca: "",
    status: "all",
  });

  const normalizar = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const etiquetasFiltrados = (etiquetas || [])
    .filter((etiqueta) => {
      const matchBusca = !filtros.busca ||
        normalizar(etiqueta.produto_nome || "").includes(normalizar(filtros.busca)) ||
        normalizar(etiqueta.codigo_produto || "").includes(normalizar(filtros.busca)) ||
        normalizar(etiqueta.lote || "").includes(normalizar(filtros.busca)) ||
        normalizar(etiqueta.SIF || "").includes(normalizar(filtros.busca));

      const matchStatus = filtros.status === "all" || etiqueta.status === filtros.status;

      return matchBusca && matchStatus;
    })
    .sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;
      
      switch (sortField) {
        case "validade":
          aValue = a.validade ? new Date(a.validade) : new Date(0);
          bValue = b.validade ? new Date(b.validade) : new Date(0);
          break;
        case "lote":
          aValue = a.lote || "";
          bValue = b.lote || "";
          break;
        case "created_at":
          aValue = a.created_at ? new Date(a.created_at) : new Date(0);
          bValue = b.created_at ? new Date(b.created_at) : new Date(0);
          break;
        default:
          return 0;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        const result = aValue.getTime() - bValue.getTime();
        return sortOrder === "asc" ? result : -result;
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue);
        return sortOrder === "asc" ? result : -result;
      }
      
      return 0;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? 
      <SortAsc className="h-4 w-4 ml-1 inline-block" /> : 
      <SortDesc className="h-4 w-4 ml-1 inline-block" />;
  };

  // Estatísticas
  const totalEtiquetas = etiquetasFiltrados.length;
  const etiquetasVencidas = etiquetasFiltrados.filter(e => 
    e.validade && new Date(e.validade) < new Date()
  ).length;
  const etiquetasProximasVencer = etiquetasFiltrados.filter(e => {
    if (!e.validade) return false;
    const validade = new Date(e.validade);
    const hoje = new Date();
    const diasRestantes = Math.floor((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes >= 0 && diasRestantes <= 7;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-1.5",
                viewMode === "grid" && "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1.5",
                viewMode === "list" && "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
            <SelectTrigger className="w-44 h-11 bg-white dark:bg-slate-800">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Data de Criação</SelectItem>
              <SelectItem value="validade">Validade</SelectItem>
              <SelectItem value="lote">Lote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <FilterSheet
          activeFiltersCount={activeFiltersCount}
          onApply={() => {}}
          onClear={clearFilters}
        >
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-300">Buscar</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  placeholder="Buscar por nome, código, lote ou SIF..."
                  value={filtros.busca}
                  onChange={(e) => updateFilter("busca", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-300">Status</label>
              <Select
                value={filtros.status}
                onValueChange={(v) => updateFilter("status", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Completo</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FilterSheet>
      </div>

      {/* Contador de resultados */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {etiquetasFiltrados.length} de {etiquetas?.length || 0} etiquetas
              </p>
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {filtros.busca && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Search className="h-3 w-3 mr-1" />
                      &quot;{filtros.busca}&quot;
                    </Badge>
                  )}
                  {filtros.status !== "all" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Filter className="h-3 w-3 mr-1" />
                      {filtros.status === "pending" ? "Pendente" : filtros.status === "completed" ? "Completo" : "Erro"}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lista ou Grid de etiquetas */}
      <div className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
          : "space-y-4"
      )}>
        {etiquetasFiltrados.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-6">
                  <Package className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhuma etiqueta encontrada
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
                  {activeFiltersCount > 0 ?
                    "Nenhuma etiqueta corresponde aos filtros aplicados" :
                    "Comece criando sua primeira etiqueta para gerenciar o rastreamento de produtos"
                  }
                </p>
                {activeFiltersCount === 0 && (
                  <Link href={`${pathname}/add`}>
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Etiqueta
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : viewMode === "grid" ? (
          etiquetasFiltrados.map((etiqueta) => {
            const titulo = etiqueta.produto_nome || etiqueta.codigo_produto || "Etiqueta sem nome";
            const validade = etiqueta.validade ? new Date(etiqueta.validade) : null;
            const hoje = new Date();
            const diasRestantes = validade ? Math.floor((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null;
            const isVencido = diasRestantes !== null && diasRestantes < 0;
            const isProximoVencer = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 7;
            
            return (
              <Link href={pathname + `/${etiqueta.id}`} key={etiqueta.id}>
                <Card className={cn(
                  "group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 h-full",
                  isVencido ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20" :
                  isProximoVencer ? "border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20" :
                  "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                )}>
                  {/* Gradiente decorativo */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    isVencido ? "bg-gradient-to-br from-red-500/10 to-transparent" :
                    isProximoVencer ? "bg-gradient-to-br from-yellow-500/10 to-transparent" :
                    "bg-gradient-to-br from-blue-500/10 to-transparent"
                  )} />
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {titulo}
                        </CardTitle>
                        {etiqueta.codigo_produto && (
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                            Código: {etiqueta.codigo_produto}
                          </p>
                        )}
                      </div>
                      {etiqueta.status && (
                        <Badge className={cn(
                          "shrink-0",
                          etiqueta.status === 'completed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          etiqueta.status === 'error' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          etiqueta.status === 'pending' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        )}>
                          {etiqueta.status === 'completed' ? 'Completo' :
                           etiqueta.status === 'error' ? 'Erro' :
                           etiqueta.status === 'pending' ? 'Pendente' : etiqueta.status}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-2 sm:space-y-3">
                    {/* Informações principais */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {etiqueta.lote && (
                        <div className="flex items-start gap-2">
                          <Layers className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Lote</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {etiqueta.lote}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {etiqueta.SIF && (
                        <div className="flex items-start gap-2">
                          <Hash className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">S.I.F</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {etiqueta.SIF}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {etiqueta.quantidade && (
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                        <Package className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Quantidade: <span className="font-bold text-slate-900 dark:text-white">{etiqueta.quantidade}</span>
                        </span>
                      </div>
                    )}
                    
                    {validade && (
                      <div className={cn(
                        "flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors",
                        isVencido ? "bg-red-100 dark:bg-red-900/30" :
                        isProximoVencer ? "bg-yellow-100 dark:bg-yellow-900/30" :
                        "bg-blue-50 dark:bg-blue-900/20"
                      )}>
                        <div className="flex items-center gap-2">
                          <Calendar className={cn(
                            "h-4 w-4",
                            isVencido ? "text-red-600 dark:text-red-400" :
                            isProximoVencer ? "text-yellow-600 dark:text-yellow-400" :
                            "text-blue-600 dark:text-blue-400"
                          )} />
                          <span className={cn(
                            "text-sm font-medium",
                            isVencido ? "text-red-700 dark:text-red-300" :
                            isProximoVencer ? "text-yellow-700 dark:text-yellow-300" :
                            "text-blue-700 dark:text-blue-300"
                          )}>
                            {validade.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {diasRestantes !== null && (
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            isVencido ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-300" :
                            isProximoVencer ? "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300" :
                            "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                          )}>
                            {isVencido ? `Vencido há ${Math.abs(diasRestantes)} dias` :
                             diasRestantes === 0 ? "Vence hoje" :
                             diasRestantes === 1 ? "Vence amanhã" :
                             `${diasRestantes} dias`}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Hover overlay com ações */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              </Link>
            );
          })
        ) : (
          /* View em lista */
          <div className="space-y-3">
            {etiquetasFiltrados.map((etiqueta) => {
              const titulo = etiqueta.produto_nome || etiqueta.codigo_produto || "Etiqueta sem nome";
              const validade = etiqueta.validade ? new Date(etiqueta.validade) : null;
              const hoje = new Date();
              const diasRestantes = validade ? Math.floor((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null;
              const isVencido = diasRestantes !== null && diasRestantes < 0;
              const isProximoVencer = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 7;
              
              return (
                <Link href={pathname + `/${etiqueta.id}`} key={etiqueta.id}>
                  <Card className={cn(
                    "group hover:shadow-lg transition-all duration-200 cursor-pointer",
                    isVencido ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20" :
                    isProximoVencer ? "border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20" :
                    "hover:border-blue-300 dark:hover:border-blue-700"
                  )}>
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                              {titulo}
                            </h3>
                            {etiqueta.status && (
                              <Badge className={cn(
                                "shrink-0",
                                etiqueta.status === 'completed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                etiqueta.status === 'error' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                etiqueta.status === 'pending' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              )}>
                                {etiqueta.status}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            {etiqueta.codigo_produto && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Hash className="h-4 w-4" />
                                <span>Código: {etiqueta.codigo_produto}</span>
                              </div>
                            )}
                            {etiqueta.lote && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Layers className="h-4 w-4" />
                                <span>Lote: {etiqueta.lote}</span>
                              </div>
                            )}
                            {etiqueta.SIF && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Building2 className="h-4 w-4" />
                                <span>S.I.F: {etiqueta.SIF}</span>
                              </div>
                            )}
                            {etiqueta.quantidade && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Package className="h-4 w-4" />
                                <span>Qtd: {etiqueta.quantidade}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Coluna de validade */}
                        {validade && (
                          <div className={cn(
                            "flex flex-col items-end gap-1 px-4 py-2 rounded-lg",
                            isVencido ? "bg-red-100 dark:bg-red-900/30" :
                            isProximoVencer ? "bg-yellow-100 dark:bg-yellow-900/30" :
                            "bg-slate-100 dark:bg-slate-800"
                          )}>
                            <div className="flex items-center gap-2">
                              <Calendar className={cn(
                                "h-4 w-4",
                                isVencido ? "text-red-600 dark:text-red-400" :
                                isProximoVencer ? "text-yellow-600 dark:text-yellow-400" :
                                "text-slate-600 dark:text-slate-400"
                              )} />
                              <span className={cn(
                                "text-sm font-medium",
                                isVencido ? "text-red-700 dark:text-red-300" :
                                isProximoVencer ? "text-yellow-700 dark:text-yellow-300" :
                                "text-slate-700 dark:text-slate-300"
                              )}>
                                {validade.toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {diasRestantes !== null && (
                              <span className={cn(
                                "text-xs font-medium",
                                isVencido ? "text-red-600 dark:text-red-400" :
                                isProximoVencer ? "text-yellow-600 dark:text-yellow-400" :
                                "text-slate-500 dark:text-slate-400"
                              )}>
                                {isVencido ? `Vencido há ${Math.abs(diasRestantes)}d` :
                                 diasRestantes === 0 ? "Vence hoje" :
                                 `${diasRestantes}d restantes`}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Botões de ação */}
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 transition-colors">
                            <Eye className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
