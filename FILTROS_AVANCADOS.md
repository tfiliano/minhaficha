# Feature: Sistema de Filtros Avançados com Sheet Lateral

## Objetivo
Criar um sistema de filtros profissional que desliza da lateral, substituindo os filtros inline atuais por uma solução mais limpa, escalável e com melhor UX.

## Benefícios
- ✅ Interface mais limpa - filtros não ocupam espaço visual
- ✅ Mais espaço para filtros complexos - pode ter muitos filtros sem poluir
- ✅ Melhor UX mobile - Sheet ocupa tela cheia, mais fácil de usar
- ✅ Visual profissional - Slide animation suave
- ✅ Reutilizável - Mesmo componente em todas as listas
- ✅ Badge de filtros ativos - Usuário sabe quantos filtros estão aplicados

## Estrutura de Arquivos

### 1. Componente FilterSheet (novo)
**Localização:** `/src/components/ui/filter-sheet.tsx`

Componente genérico e reutilizável que recebe:
- `children`: React.ReactNode - Conteúdo dos filtros (selects, inputs, etc)
- `onApply`: () => void - Callback ao aplicar filtros
- `onClear`: () => void - Callback ao limpar filtros
- `activeFiltersCount`: number - Quantidade de filtros ativos (para badge)
- `trigger`: React.ReactNode (opcional) - Botão customizado

**Features:**
- Sheet do Radix UI (lado direito no desktop, bottom no mobile)
- Header com título "Filtros" e botão de fechar
- Área de scroll para os filtros
- Footer fixo com botões "Limpar filtros" e "Aplicar"
- Badge mostrando quantidade de filtros ativos no trigger

### 2. Refatorar ProdutosView
**Localização:** `/src/components/admin/produtos-view.tsx`

**Mudanças:**
1. Remover filtros inline (selects de grupo, armazenamento, produto pai)
2. Manter apenas: busca, botão de view mode (grid/list)
3. Adicionar botão "Filtros" com badge de filtros ativos
4. Mover lógica de filtros para dentro do FilterSheet
5. Criar estado para controlar Sheet aberto/fechado

**Estado dos filtros:**
```typescript
const [filtros, setFiltros] = useState({
  grupo: "all",
  armazenamento: "all",
  produtoPai: "all",
  ativo: "all", // novo filtro
});
```

**Contador de filtros ativos:**
```typescript
const filtrosAtivos = Object.values(filtros).filter(v => v !== "all").length;
```

### 3. Hook customizado (opcional, mas recomendado)
**Localização:** `/src/hooks/use-filters.ts`

```typescript
export function useFilters<T extends Record<string, any>>(initialFilters: T) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (key: keyof T, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const activeFiltersCount = Object.entries(filters)
    .filter(([key, value]) => value !== initialFilters[key])
    .length;

  return { filters, updateFilter, clearFilters, activeFiltersCount };
}
```

## Implementação Detalhada

### Fase 1: Criar FilterSheet component

```tsx
// src/components/ui/filter-sheet.tsx
"use client";

import { ReactNode, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterSheetProps {
  children: ReactNode;
  onApply: () => void;
  onClear: () => void;
  activeFiltersCount: number;
  trigger?: ReactNode;
}

export function FilterSheet({
  children,
  onApply,
  onClear,
  activeFiltersCount,
  trigger,
}: FilterSheetProps) {
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onApply();
    setOpen(false);
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" className="relative gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge
                variant="default"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
          <SheetDescription>
            Refine sua busca aplicando filtros personalizados
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 py-4">
            {children}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1"
          >
            <Filter className="h-4 w-4 mr-2" />
            Aplicar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

### Fase 2: Refatorar ProdutosView

**ANTES (filtros inline - remover):**
```tsx
// Filtros inline que ocupam muito espaço
<div className="grid gap-3 sm:grid-cols-3">
  <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
    {/* ... */}
  </Select>
  <Select value={filtroArmazenamento} onValueChange={setFiltroArmazenamento}>
    {/* ... */}
  </Select>
  <Select value={filtroProdutoPai} onValueChange={setFiltroProdutoPai}>
    {/* ... */}
  </Select>
</div>
```

**DEPOIS (botão com FilterSheet):**
```tsx
// Import no topo
import { FilterSheet } from "@/components/ui/filter-sheet";
import { useFilters } from "@/hooks/use-filters";

// Dentro do componente
const {
  filters: filtros,
  updateFilter,
  clearFilters,
  activeFiltersCount
} = useFilters({
  grupo: "all",
  armazenamento: "all",
  produtoPai: "all",
  ativo: "all",
});

// No render, substituir os selects inline por:
<div className="flex items-center gap-2">
  <div className="flex-1">
    <Input
      placeholder="Buscar produtos..."
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
      className="max-w-sm"
      icon={<Search className="h-4 w-4" />}
    />
  </div>

  <FilterSheet
    activeFiltersCount={activeFiltersCount}
    onApply={() => {
      // Filtros já estão aplicados no estado
      // Opcional: toast de confirmação
    }}
    onClear={clearFilters}
  >
    {/* Filtros dentro do Sheet */}
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Grupo</label>
        <Select
          value={filtros.grupo}
          onValueChange={(v) => updateFilter("grupo", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os grupos" />
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
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Armazenamento</label>
        <Select
          value={filtros.armazenamento}
          onValueChange={(v) => updateFilter("armazenamento", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os armazenamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os armazenamentos</SelectItem>
            {armazenamentos.map((arm) => (
              <SelectItem key={arm} value={arm}>
                {arm}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Status</label>
        <Select
          value={filtros.ativo}
          onValueChange={(v) => updateFilter("ativo", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Ativos</SelectItem>
            <SelectItem value="false">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Adicionar mais filtros conforme necessário */}
    </div>
  </FilterSheet>

  {/* View mode toggle */}
  <div className="flex items-center gap-1 border rounded-lg p-1">
    <Button
      variant={viewMode === "grid" ? "default" : "ghost"}
      size="sm"
      onClick={() => setViewMode("grid")}
    >
      <Grid3X3 className="h-4 w-4" />
    </Button>
    <Button
      variant={viewMode === "list" ? "default" : "ghost"}
      size="sm"
      onClick={() => setViewMode("list")}
    >
      <List className="h-4 w-4" />
    </Button>
  </div>
</div>
```

### Fase 3: Atualizar lógica de filtragem

```typescript
// Aplicar todos os filtros
const produtosFiltrados = produtos.filter((produto) => {
  // Busca
  const matchBusca = busca === "" ||
    normalizar(produto.nome || "").includes(normalizar(busca)) ||
    normalizar(produto.codigo || "").includes(normalizar(busca));

  // Filtro de grupo
  const matchGrupo = filtros.grupo === "all" ||
    produto.grupo === filtros.grupo;

  // Filtro de armazenamento
  const matchArmazenamento = filtros.armazenamento === "all" ||
    produto.armazenamento === filtros.armazenamento;

  // Filtro de status
  const matchAtivo = filtros.ativo === "all" ||
    (filtros.ativo === "true" && produto.ativo) ||
    (filtros.ativo === "false" && !produto.ativo);

  // Filtro de produto pai
  const matchProdutoPai = filtros.produtoPai === "all" ||
    produto.originado === filtros.produtoPai;

  return matchBusca && matchGrupo && matchArmazenamento && matchAtivo && matchProdutoPai;
});
```

## Próximos Passos (Expansão Futura)

1. **Adicionar mais filtros:**
   - Data de criação (range)
   - Preço (range)
   - Fabricante
   - País de origem
   - Tags/Categorias

2. **Melhorias UX:**
   - Salvar filtros no localStorage
   - Filtros predefinidos (ex: "Produtos em falta", "Vencendo em 7 dias")
   - Exportar produtos filtrados para Excel
   - URL state - filtros persistem na URL para compartilhar

3. **Aplicar em outras listagens:**
   - `/admin/operadores`
   - `/admin/grupos`
   - `/admin/fabricantes`
   - `/admin/armazenamentos`
   - `/admin/etiquetas`

4. **Componente ainda mais reutilizável:**
   - Criar `FilterGroup` component para agrupar filtros relacionados
   - Adicionar animações de entrada/saída
   - Suporte a filtros customizados (datepicker, range slider, etc)

## Notas de Implementação

- Usar `Sheet` do shadcn/ui que já está instalado
- Manter os filtros reativos - aplicar instantaneamente ao mudar
- Botão "Aplicar" serve mais para fechar o Sheet
- Badge deve ser visível e chamar atenção quando há filtros ativos
- No mobile, Sheet deve vir de baixo (bottom) para melhor ergonomia
- Scroll suave na lista de filtros para muitos filtros

## Estado Atual vs Estado Final

**ATUAL:**
- Filtros inline ocupando espaço
- Dificuldade para adicionar novos filtros
- UX mobile ruim (selects pequenos)
- Não escalável

**FINAL:**
- Interface limpa, só busca + botão filtros
- Fácil adicionar quantos filtros quiser
- UX mobile excelente (Sheet em fullscreen)
- Badge mostra filtros ativos
- Totalmente escalável e reutilizável
