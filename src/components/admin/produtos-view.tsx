"use client";

import { useState } from "react";
import { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Grid3X3,
  List,
  Package,
  Tag,
  Warehouse,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Produto = Tables<"produtos">;

type ViewMode = "grid" | "list";
type SortField = "nome" | "codigo" | "grupo" | "unidade" | "created_at";
type SortOrder = "asc" | "desc";

interface ProdutosViewProps {
  produtos: Produto[];
}

export function ProdutosView({ produtos }: ProdutosViewProps) {
  const pathname = usePathname();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [busca, setBusca] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState<string>("all");
  const [filtroArmazenamento, setFiltroArmazenamento] = useState<string>("all");
  const [filtroProdutoPai, setFiltroProdutoPai] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("nome");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Extrair grupos, armazenamentos e produtos pai únicos para filtros
  const grupos = Array.from(new Set(produtos.map(p => p.grupo).filter(Boolean)));
  const armazenamentos = Array.from(new Set(produtos.map(p => p.armazenamento).filter(Boolean)));
  const produtosPai = produtos.filter(p => p.originado).map(p => {
    const pai = produtos.find(pp => pp.id === p.originado);
    return pai ? { id: pai.id, nome: pai.nome } : null;
  }).filter(Boolean);
  const produtosPaiUnicos = Array.from(new Map(produtosPai.map(p => [p!.id, p])).values());

  const normalizar = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Aplicar filtros e ordenação
  const produtosFiltrados = produtos
    .filter((produto) => {
      const matchBusca = 
        normalizar(produto.nome).includes(normalizar(busca)) ||
        normalizar(produto.codigo || "").includes(normalizar(busca));
      
      const matchGrupo = filtroGrupo === "all" || produto.grupo === filtroGrupo;
      const matchArmazenamento = filtroArmazenamento === "all" || produto.armazenamento === filtroArmazenamento;
      const matchProdutoPai = filtroProdutoPai === "all" || produto.originado === filtroProdutoPai;
      
      return matchBusca && matchGrupo && matchArmazenamento && matchProdutoPai;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortField) {
        case "nome":
          aValue = a.nome || "";
          bValue = b.nome || "";
          break;
        case "codigo":
          aValue = a.codigo || "";
          bValue = b.codigo || "";
          break;
        case "grupo":
          aValue = a.grupo || "";
          bValue = b.grupo || "";
          break;
        case "unidade":
          aValue = a.unidade || "";
          bValue = b.unidade || "";
          break;
        default:
          aValue = "";
          bValue = "";
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
      <SortAsc className="h-4 w-4 ml-1" /> : 
      <SortDesc className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
              <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <Input
              placeholder="Buscar produtos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-12 h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-700 dark:text-slate-300"
            />
          </div>

          {/* Filtros e controles */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filtro por grupo */}
            <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
              <SelectTrigger className="w-[160px] sm:w-[180px] h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:shadow-md transition-all font-medium">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/30">
                    <Filter className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <SelectValue placeholder="Grupo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os grupos</SelectItem>
                {grupos.map((grupo) => (
                  <SelectItem key={grupo} value={grupo}>
                    {grupo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por armazenamento */}
            <Select value={filtroArmazenamento} onValueChange={setFiltroArmazenamento}>
              <SelectTrigger className="w-[160px] sm:w-[200px] h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:shadow-md transition-all font-medium">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/30">
                    <Warehouse className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <SelectValue placeholder="Armazenamento" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os armazenamentos</SelectItem>
                {armazenamentos.map((armazenamento) => (
                  <SelectItem key={armazenamento} value={armazenamento || ''}>
                    {armazenamento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por produto pai */}
            {produtosPaiUnicos.length > 0 && (
              <Select value={filtroProdutoPai} onValueChange={setFiltroProdutoPai}>
                <SelectTrigger className="w-[140px] sm:w-[160px] h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:shadow-md transition-all font-medium">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                      <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <SelectValue placeholder="Produto Pai" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os pais</SelectItem>
                  {produtosPaiUnicos.map((produtoPai) => (
                    <SelectItem key={produtoPai!.id} value={produtoPai!.id}>
                      {produtoPai!.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Toggle de visualização */}
            <div className="flex bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-1 shadow-sm">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-10 px-4 transition-all font-medium",
                  viewMode === "grid" 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
                title="Visualizar em cards"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-10 px-4 transition-all font-medium",
                  viewMode === "list" 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
                title="Visualizar em lista"
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
            </div>
          </div>
        </div>
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
                {produtosFiltrados.length} de {produtos.length} produtos
              </p>
              {(busca || filtroGrupo !== "all" || filtroArmazenamento !== "all" || filtroProdutoPai !== "all") && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {busca && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Search className="h-3 w-3 mr-1" />
                      &quot;{busca}&quot;
                    </Badge>
                  )}
                  {filtroGrupo !== "all" && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      <Filter className="h-3 w-3 mr-1" />
                      {filtroGrupo}
                    </Badge>
                  )}
                  {filtroArmazenamento !== "all" && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <Warehouse className="h-3 w-3 mr-1" />
                      {filtroArmazenamento}
                    </Badge>
                  )}
                  {filtroProdutoPai !== "all" && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Package className="h-3 w-3 mr-1" />
                      {produtosPaiUnicos.find(p => p!.id === filtroProdutoPai)?.nome}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {produtosFiltrados.map((produto) => (
            <Card key={produto.id} className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 border-0 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold leading-tight truncate text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {produto.nome}
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-1.5 text-sm font-medium">
                      <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                        <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-400">{produto.codigo}</span>
                    </CardDescription>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <Link href={`${pathname}/${produto.id}`}>
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800">
                        <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="text-xs font-medium bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border-0">
                      <div className="p-0.5 rounded-sm bg-emerald-200 dark:bg-emerald-800 mr-1.5">
                        <Package className="h-3 w-3 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      {produto.unidade}
                    </Badge>
                    {produto.grupo && (
                      <Badge variant="outline" className="text-xs font-medium bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                        {produto.grupo}
                      </Badge>
                    )}
                  </div>
                  
                  {produto.armazenamento && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/30">
                        <Warehouse className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{produto.armazenamento}</span>
                    </div>
                  )}
                  
                  {produto.dias_validade && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="p-1 rounded-md bg-rose-100 dark:bg-rose-900/30">
                        <Calendar className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{produto.dias_validade} dias de validade</span>
                    </div>
                  )}

                  <Link href={`${pathname}/${produto.id}`} className="block">
                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 font-medium">
                      Ver detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <TableHead 
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 select-none transition-colors font-semibold"
                    onClick={() => toggleSort("codigo")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                        <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Código
                      <SortIcon field="codigo" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 select-none min-w-[200px] transition-colors font-semibold"
                    onClick={() => toggleSort("nome")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                        <Package className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Nome
                      <SortIcon field="nome" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 select-none hidden sm:table-cell transition-colors font-semibold"
                    onClick={() => toggleSort("grupo")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/30">
                        <Filter className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      </div>
                      Grupo
                      <SortIcon field="grupo" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 select-none transition-colors font-semibold"
                    onClick={() => toggleSort("unidade")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                        <Package className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                      </div>
                      Unidade
                      <SortIcon field="unidade" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/30">
                        <Warehouse className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      Armazenamento
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-rose-100 dark:bg-rose-900/30">
                        <Calendar className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                      </div>
                      Validade
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px] font-semibold text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => (
                  <TableRow key={produto.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors border-slate-200 dark:border-slate-700">
                    <TableCell className="font-mono text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                          {produto.codigo}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <div className="truncate text-slate-900 dark:text-slate-100 font-semibold">{produto.nome}</div>
                        {/* Mostrar grupo no mobile quando coluna está oculta */}
                        {produto.grupo && (
                          <div className="sm:hidden mt-2">
                            <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                              {produto.grupo}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {produto.grupo && (
                        <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                          {produto.grupo}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border-0">
                        {produto.unidade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell font-medium">
                      {produto.armazenamento || (
                        <span className="text-slate-400 dark:text-slate-500 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell font-medium">
                      {produto.dias_validade ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {produto.dias_validade} dias
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={`${pathname}/${produto.id}`}>
                        <Button size="sm" className="h-9 w-9 p-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Estado vazio */}
      {produtosFiltrados.length === 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-20 animate-pulse" />
              <div className="relative p-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                <Package className="h-16 w-16 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
              {busca || filtroGrupo !== "all" || filtroArmazenamento !== "all" || filtroProdutoPai !== "all" 
                ? "Nenhum produto encontrado" 
                : "Nenhum produto cadastrado"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center max-w-md text-lg leading-relaxed">
              {busca || filtroGrupo !== "all" || filtroArmazenamento !== "all" || filtroProdutoPai !== "all"
                ? "Tente ajustar os filtros ou termos de busca para encontrar produtos."
                : "Comece adicionando produtos ao seu catálogo."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}