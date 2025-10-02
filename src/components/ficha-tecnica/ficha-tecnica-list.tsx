"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChefHat, ListChecks, Image as ImageIcon, Filter, X, Plus } from "lucide-react";
import Link from "next/link";

type Produto = {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  grupo: string;
  setor: string;
  totalIngredientes: number;
  fotoCapa: string | null;
};

type FichaTecnicaListProps = {
  produtos: Produto[];
};

export function FichaTecnicaList({ produtos }: FichaTecnicaListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [grupoFilter, setGrupoFilter] = useState<string>("todos");
  const [setorFilter, setSetorFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // Extrair grupos e setores únicos
  const grupos = useMemo(() => {
    const uniqueGrupos = Array.from(new Set(produtos.map((p) => p.grupo))).filter(Boolean);
    return uniqueGrupos.sort();
  }, [produtos]);

  const setores = useMemo(() => {
    const uniqueSetores = Array.from(new Set(produtos.map((p) => p.setor))).filter(Boolean);
    return uniqueSetores.sort();
  }, [produtos]);

  // Filtrar produtos
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      // Busca por nome ou código
      const matchSearch =
        searchTerm === "" ||
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.codigo.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por grupo
      const matchGrupo = grupoFilter === "todos" || produto.grupo === grupoFilter;

      // Filtro por setor
      const matchSetor = setorFilter === "todos" || produto.setor === setorFilter;

      // Filtro por status
      let matchStatus = true;
      if (statusFilter === "com-ingredientes") {
        matchStatus = produto.totalIngredientes > 0;
      } else if (statusFilter === "sem-ingredientes") {
        matchStatus = produto.totalIngredientes === 0;
      } else if (statusFilter === "com-foto") {
        matchStatus = produto.fotoCapa !== null;
      } else if (statusFilter === "sem-foto") {
        matchStatus = produto.fotoCapa === null;
      }

      return matchSearch && matchGrupo && matchSetor && matchStatus;
    });
  }, [produtos, searchTerm, grupoFilter, setorFilter, statusFilter]);

  const hasActiveFilters = grupoFilter !== "todos" || setorFilter !== "todos" || statusFilter !== "todos";

  const clearFilters = () => {
    setSearchTerm("");
    setGrupoFilter("todos");
    setSetorFilter("todos");
    setStatusFilter("todos");
  };

  const hasAnyFilters = searchTerm !== "" || hasActiveFilters;

  return (
    <div className="space-y-3">
      {/* Barra de Ações */}
      <div className="flex items-center">
        <div className="flex-1 flex justify-center">
          <Button asChild variant="default" className="bg-orange-600 hover:bg-orange-700">
            <Link href="/admin/produtos/add">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Link>
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasAnyFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-600 rounded-full" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Busca e Filtros</SheetTitle>
              <SheetDescription>
                Busque e refine as fichas técnicas
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              {/* Campo de Busca */}
              <div className="space-y-2">
                <Label>Buscar</Label>
                <Input
                  placeholder="Nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filtro por Grupo */}
              <div className="space-y-2">
                <Label>Grupo</Label>
                <Select value={grupoFilter} onValueChange={setGrupoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os grupos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os grupos</SelectItem>
                    {grupos.map((grupo) => (
                      <SelectItem key={grupo} value={grupo}>
                        {grupo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Setor */}
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select value={setorFilter} onValueChange={setSetorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os setores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os setores</SelectItem>
                    {setores.map((setor) => (
                      <SelectItem key={setor} value={setor}>
                        {setor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="com-ingredientes">Com ingredientes</SelectItem>
                    <SelectItem value="sem-ingredientes">Sem ingredientes</SelectItem>
                    <SelectItem value="com-foto">Com foto</SelectItem>
                    <SelectItem value="sem-foto">Sem foto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botão Limpar Filtros */}
              {hasAnyFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Limpar Tudo
                </Button>
              )}

              {/* Info de resultados */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {produtosFiltrados.length} {produtosFiltrados.length === 1 ? "resultado" : "resultados"}
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Grid de Produtos */}
      {produtosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nenhuma ficha técnica encontrada
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {produtosFiltrados.map((produto) => (
            <Link
              key={produto.id}
              href={`/ficha-tecnica/${produto.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border hover:border-orange-300 dark:hover:border-orange-700 overflow-hidden">
                {/* Foto de Capa (se existir) */}
                {produto.fotoCapa && (
                  <div className="relative h-32 w-full bg-slate-100 dark:bg-slate-800">
                    <img
                      src={produto.fotoCapa}
                      alt={produto.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <ChefHat className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {produto.codigo}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1 line-clamp-2">
                        {produto.nome}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                        <span className="truncate">{produto.grupo}</span>
                        <span className="text-slate-400">•</span>
                        <span className="truncate">{produto.setor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges de Status */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {produto.totalIngredientes > 0 ? (
                      <Badge variant="default" className="bg-green-600 text-[10px] px-1.5 py-0">
                        <ListChecks className="h-2.5 w-2.5 mr-0.5" />
                        {produto.totalIngredientes}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-[10px] px-1.5 py-0">
                        Sem ingred.
                      </Badge>
                    )}
                    {produto.fotoCapa && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        <ImageIcon className="h-2.5 w-2.5 mr-0.5" />
                        Foto
                      </Badge>
                    )}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-auto">
                      {produto.unidade}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
