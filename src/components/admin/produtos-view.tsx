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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros e controles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro por grupo */}
          <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
            <SelectTrigger className="w-[140px] sm:w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Grupo" />
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
            <SelectTrigger className="w-[140px] sm:w-[180px]">
              <Warehouse className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Armazenamento" />
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
              <SelectTrigger className="w-[120px] sm:w-[140px]">
                <Package className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Produto Pai" />
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
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-2"
              title="Visualizar em cards"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="sr-only">Cards</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-2"
              title="Visualizar em lista"
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Lista</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {produtosFiltrados.length} de {produtos.length} produtos
          {busca && ` • Buscando por "${busca}"`}
          {filtroGrupo !== "all" && ` • Grupo: ${filtroGrupo}`}
          {filtroArmazenamento !== "all" && ` • Armazenamento: ${filtroArmazenamento}`}
          {filtroProdutoPai !== "all" && ` • Produto Pai: ${produtosPaiUnicos.find(p => p!.id === filtroProdutoPai)?.nome}`}
        </span>
      </div>

      {/* Conteúdo principal */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {produtosFiltrados.map((produto) => (
            <Card key={produto.id} className="hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-medium leading-tight truncate">
                      {produto.nome}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {produto.codigo}
                    </CardDescription>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Link href={`${pathname}/${produto.id}`}>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      <Package className="h-3 w-3 mr-1" />
                      {produto.unidade}
                    </Badge>
                    {produto.grupo && (
                      <Badge variant="outline" className="text-xs">
                        {produto.grupo}
                      </Badge>
                    )}
                  </div>
                  
                  {produto.armazenamento && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Warehouse className="h-3 w-3 mr-1" />
                      {produto.armazenamento}
                    </div>
                  )}
                  
                  {produto.dias_validade && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {produto.dias_validade} dias de validade
                    </div>
                  )}

                  <Link href={`${pathname}/${produto.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Ver detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => toggleSort("codigo")}
                  >
                    <div className="flex items-center">
                      Código
                      <SortIcon field="codigo" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none min-w-[200px]"
                    onClick={() => toggleSort("nome")}
                  >
                    <div className="flex items-center">
                      Nome
                      <SortIcon field="nome" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none hidden sm:table-cell"
                    onClick={() => toggleSort("grupo")}
                  >
                    <div className="flex items-center">
                      Grupo
                      <SortIcon field="grupo" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => toggleSort("unidade")}
                  >
                    <div className="flex items-center">
                      Unidade
                      <SortIcon field="unidade" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Armazenamento</TableHead>
                  <TableHead className="hidden lg:table-cell">Validade</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => (
                  <TableRow key={produto.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {produto.codigo}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <div className="truncate">{produto.nome}</div>
                        {/* Mostrar grupo no mobile quando coluna está oculta */}
                        {produto.grupo && (
                          <div className="sm:hidden mt-1">
                            <Badge variant="outline" className="text-xs">
                              {produto.grupo}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {produto.grupo && (
                        <Badge variant="outline" className="text-xs">
                          {produto.grupo}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {produto.unidade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {produto.armazenamento || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {produto.dias_validade ? `${produto.dias_validade} dias` : "-"}
                    </TableCell>
                    <TableCell>
                      <Link href={`${pathname}/${produto.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {busca || filtroGrupo !== "all" || filtroArmazenamento !== "all" || filtroProdutoPai !== "all" 
                ? "Nenhum produto encontrado" 
                : "Nenhum produto cadastrado"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
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