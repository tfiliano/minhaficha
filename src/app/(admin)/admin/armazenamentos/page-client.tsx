"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/database.types";
import {
  Search,
  Warehouse,
  Plus,
  Thermometer,
  Hash,
  Archive,
  Package,
  Filter
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { useFilters } from "@/hooks/use-filters";

type LocalArmazanamento = Tables<`locais_armazenamento`>;

type LocaisArmazenamento = {
  locais_armazenamento: LocalArmazanamento[] | null;
};

export function LocaisArmazenamentoClient({
  locais_armazenamento,
}: PropsWithChildren<LocaisArmazenamento>) {
  const pathname = usePathname();

  const {
    filters: filtros,
    updateFilter,
    clearFilters,
    activeFiltersCount
  } = useFilters({
    busca: "",
  });

  const normalizar = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const locais_armazenamentoFiltrados = (locais_armazenamento || []).filter((local) => {
    return !filtros.busca ||
      normalizar(local.armazenamento || "").includes(normalizar(filtros.busca)) ||
      normalizar(local.metodo || "").includes(normalizar(filtros.busca));
  });

  const getMetodoInfo = (metodo: string | null) => {
    switch (metodo) {
      case 'refrigerado':
        return {
          label: 'Refrigerado',
          icon: Thermometer,
          color: 'blue',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-700 dark:text-blue-400'
        };
      case 'congelado':
        return {
          label: 'Congelado',
          icon: Thermometer,
          color: 'cyan',
          bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
          textColor: 'text-cyan-700 dark:text-cyan-400'
        };
      case 'ambiente':
        return {
          label: 'Ambiente',
          icon: Archive,
          color: 'amber',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          textColor: 'text-amber-700 dark:text-amber-400'
        };
      default:
        return {
          label: metodo || 'Não especificado',
          icon: Package,
          color: 'slate',
          bgColor: 'bg-slate-100 dark:bg-slate-800',
          textColor: 'text-slate-700 dark:text-slate-300'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-end gap-3">
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
                  placeholder="Buscar por nome ou método..."
                  value={filtros.busca}
                  onChange={(e) => updateFilter("busca", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </FilterSheet>
      </div>

      {/* Contador de resultados */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Warehouse className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {locais_armazenamentoFiltrados.length} de {locais_armazenamento?.length || 0} locais
              </p>
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {filtros.busca && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Search className="h-3 w-3 mr-1" />
                      &quot;{filtros.busca}&quot;
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de locais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {locais_armazenamentoFiltrados.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-6">
                  <Warehouse className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhum local encontrado
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
                  {activeFiltersCount > 0 ?
                    "Nenhum local corresponde aos filtros aplicados" :
                    "Comece cadastrando seu primeiro local de armazenamento"
                  }
                </p>
                {activeFiltersCount === 0 && (
                  <Link href={`${pathname}/add`}>
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Local
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          locais_armazenamentoFiltrados.map((local) => {
            const metodoInfo = getMetodoInfo(local.metodo);
            const MetodoIcon = metodoInfo.icon;
            
            return (
              <Link href={pathname + `/${local.id}`} key={local.id}>
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 h-full">
                  {/* Gradiente decorativo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                          {local.armazenamento}
                        </CardTitle>
                        {local.id && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {local.id.slice(0, 8)}
                          </p>
                        )}
                      </div>
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <Warehouse className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-4">
                    {/* Método de armazenamento */}
                    {local.metodo && (
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        metodoInfo.bgColor
                      )}>
                        <MetodoIcon className={cn("h-5 w-5", metodoInfo.textColor)} />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Método</p>
                          <p className={cn("font-semibold text-sm", metodoInfo.textColor)}>
                            {metodoInfo.label}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Informações adicionais */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Local de Estoque</p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {local.armazenamento}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Hover overlay com ações */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}