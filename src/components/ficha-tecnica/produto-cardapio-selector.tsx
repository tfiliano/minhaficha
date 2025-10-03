"use client";

import { useState, useEffect } from "react";
import { Search, ChefHat, X, ListPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchProdutos, getCardapioItemsSemFicha } from "@/app/(app)/ficha-tecnica/actions";
import { useRouter } from "next/navigation";

type Produto = {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  grupo: string;
};

type ProdutoCardapioSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProdutoCardapioSelector({ open, onOpenChange }: ProdutoCardapioSelectorProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showingSemFicha, setShowingSemFicha] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        setShowingSemFicha(false);
        const result = await searchProdutos(searchTerm, true); // true = apenas itens de cardápio
        if (result.success && result.data) {
          setProdutos(result.data);
        }
        setIsSearching(false);
      } else {
        setProdutos([]);
        setShowingSemFicha(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleLoadProdutosSemFicha = async () => {
    setIsSearching(true);
    const result = await getCardapioItemsSemFicha();
    if (result.success && result.data) {
      setProdutos(result.data);
      setShowingSemFicha(true);
    }
    setIsSearching(false);
  };

  const handleSelectProduto = (produto: Produto) => {
    router.push(`/ficha-tecnica/${produto.id}`);
    onOpenChange(false);
    setSearchTerm("");
    setProdutos([]);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchTerm("");
    setProdutos([]);
    setShowingSemFicha(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-600" />
            Selecionar Produto do Cardápio
          </DialogTitle>
          <DialogDescription>
            Busque e selecione um produto para criar ou editar sua ficha técnica
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Digite o código ou nome do produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Resultados da busca */}
          <div className="max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                Buscando produtos...
              </div>
            ) : searchTerm.length < 2 && !showingSemFicha ? (
              <div className="p-8 text-center text-slate-500">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm mb-4">Digite pelo menos 2 caracteres para buscar</p>
                <Button
                  onClick={handleLoadProdutosSemFicha}
                  variant="outline"
                  className="border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-900/10"
                >
                  <ListPlus className="h-4 w-4 mr-2" />
                  Mostrar produtos sem ficha técnica
                </Button>
              </div>
            ) : produtos.length > 0 ? (
              <div className="space-y-2">
                {showingSemFicha && (
                  <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-200">
                      <ListPlus className="h-4 w-4" />
                      <span className="font-medium">
                        {produtos.length} {produtos.length === 1 ? "produto" : "produtos"} sem ficha técnica
                      </span>
                    </div>
                  </div>
                )}
                {produtos.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => handleSelectProduto(produto)}
                    className="w-full p-4 text-left hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {produto.codigo}
                          </Badge>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {produto.nome}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{produto.grupo}</span>
                          <span>•</span>
                          <span>{produto.unidade}</span>
                        </div>
                      </div>
                      <ChefHat className="h-5 w-5 text-orange-600 shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm">Nenhum produto encontrado</p>
                <p className="text-xs text-slate-400 mt-1">
                  Tente buscar por outro nome ou código
                </p>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
