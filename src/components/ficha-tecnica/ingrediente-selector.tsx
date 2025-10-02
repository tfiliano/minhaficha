"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchProdutos } from "@/app/(app)/ficha-tecnica/actions";
import { cn } from "@/lib/utils";

type Produto = {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  grupo: string;
};

type IngredienteSelectorProps = {
  onSelect: (produto: Produto, quantidade: number) => void;
  excludeIds?: string[];
};

export function IngredienteSelector({ onSelect, excludeIds = [] }: IngredienteSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState<string>("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        const result = await searchProdutos(searchTerm);
        if (result.success && result.data) {
          // Filtrar produtos excluídos
          const filtered = result.data.filter(p => !excludeIds.includes(p.id));
          setProdutos(filtered);
          setShowResults(true);
        }
        setIsSearching(false);
      } else {
        setProdutos([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, excludeIds]);

  const handleSelectProduto = (produto: Produto) => {
    setSelectedProduto(produto);
    setSearchTerm("");
    setShowResults(false);
    setProdutos([]);
  };

  const handleAddIngrediente = () => {
    if (selectedProduto && quantidade && parseFloat(quantidade) > 0) {
      onSelect(selectedProduto, parseFloat(quantidade));
      setSelectedProduto(null);
      setQuantidade("");
    }
  };

  const handleCancelSelection = () => {
    setSelectedProduto(null);
    setQuantidade("");
  };

  return (
    <div className="space-y-4">
      {!selectedProduto ? (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Digite o código ou nome do produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Resultados da busca */}
          {showResults && (
            <Card className="absolute z-10 w-full mt-2 max-h-96 overflow-y-auto">
              <CardContent className="p-0">
                {isSearching ? (
                  <div className="p-4 text-center text-slate-500">
                    Buscando produtos...
                  </div>
                ) : produtos.length > 0 ? (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {produtos.map((produto) => (
                      <button
                        key={produto.id}
                        onClick={() => handleSelectProduto(produto)}
                        className="w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs shrink-0">
                                {produto.codigo}
                              </Badge>
                              <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {produto.nome}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{produto.grupo}</span>
                              <span>•</span>
                              <span>{produto.unidade}</span>
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    Nenhum produto encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="border-2 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{selectedProduto.codigo}</Badge>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedProduto.nome}
                  </span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedProduto.grupo} • {selectedProduto.unidade}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelSelection}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  Quantidade ({selectedProduto.unidade})
                </label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder={`Ex: 1, 0.5, 2.5 ${selectedProduto.unidade}`}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleAddIngrediente}
                disabled={!quantidade || parseFloat(quantidade) <= 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Ingrediente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
