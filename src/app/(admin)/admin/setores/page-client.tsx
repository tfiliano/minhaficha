"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/database.types";
import {
  Search,
  Users,
  Plus,
  Palette,
  Hash,
  Building,
  Filter
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { useFilters } from "@/hooks/use-filters";

type Setor = Tables<`setores`>;

type SetoresPage = {
  setores: Setor[] | null;
};

export function SetoresPageClient({ setores }: PropsWithChildren<SetoresPage>) {
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

  const setoresFiltrados = (setores || []).filter((setor) => {
    return !filtros.busca || normalizar(setor.nome || "").includes(normalizar(filtros.busca));
  });

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
                  placeholder="Buscar por nome..."
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
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {setoresFiltrados.length} de {setores?.length || 0} setores
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

      {/* Grid de setores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {setoresFiltrados.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-6">
                  <Users className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhum setor encontrado
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
                  {activeFiltersCount > 0 ?
                    "Nenhum setor corresponde aos filtros aplicados" :
                    "Comece criando setores para organizar sua empresa"
                  }
                </p>
                {activeFiltersCount === 0 && (
                  <Link href={`${pathname}/add`}>
                    <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Setor
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          setoresFiltrados.map((setor) => {
            const corBotao = setor.cor_botao || '#6366F1';
            const corFonte = setor.cor_fonte || '#FFFFFF';
            
            return (
              <Link href={pathname + `/${setor.id}`} key={setor.id}>
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 h-full">
                  {/* Gradiente decorativo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {setor.nome}
                        </CardTitle>
                        {setor.id && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {setor.id.slice(0, 8)}
                          </p>
                        )}
                      </div>
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-4">
                    {/* Preview das cores */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Palette className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cor do Botão</p>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                              style={{ backgroundColor: corBotao }}
                            />
                            <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                              {corBotao}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Palette className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cor da Fonte</p>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center"
                              style={{ backgroundColor: corFonte }}
                            >
                              <span className="text-xs font-bold" style={{ color: corBotao }}>A</span>
                            </div>
                            <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                              {corFonte}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview do setor */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Preview</p>
                      <div 
                        className="px-4 py-2 rounded-lg text-center font-semibold text-sm shadow-sm flex items-center justify-center gap-2"
                        style={{ 
                          backgroundColor: corBotao,
                          color: corFonte
                        }}
                      >
                        <Building className="h-4 w-4" />
                        {setor.nome}
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