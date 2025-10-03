"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IngredienteSelector } from "./ingrediente-selector";
import { ModoPreparo } from "./modo-preparo";
import { FotosManager } from "./fotos-manager";
import { addIngrediente, removeIngrediente, updateIngrediente } from "@/app/(app)/ficha-tecnica/actions";
import type { FichaTecnicaFoto } from "@/app/(app)/ficha-tecnica/actions";
import { toast } from "sonner";
import { Trash2, Edit2, Save, X, Package, BookOpen, Camera } from "lucide-react";

type Produto = {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  grupo: string;
};

type IngredienteItem = {
  id: string;
  produto_ingrediente_id: string;
  quantidade: number;
  unidade: string;
  custo_unitario?: number;
  fator_correcao?: number;
  observacoes?: string;
  produto?: {
    id: string;
    codigo: string;
    nome: string;
    unidade: string;
    grupo: string;
    custo_unitario?: number;
  };
};

// Função para calcular o custo do ingrediente
// Fórmula: quantidade × fator_correcao × custo_unitario_produto
function calcularCustoIngrediente(item: IngredienteItem): number {
  const quantidade = item.quantidade || 0;
  const fatorCorrecao = item.fator_correcao || 1.0;
  const custoUnitarioProduto = item.produto?.custo_unitario || 0;

  return quantidade * fatorCorrecao * custoUnitarioProduto;
}

type FichaTecnicaFormProps = {
  fichaTecnicaId: string;
  lojaId: string;
  produtoCardapio: {
    id: string;
    codigo: string;
    nome: string;
    unidade: string;
  };
  ingredientes: IngredienteItem[];
  fotos: FichaTecnicaFoto[];
  porcoes?: number;
  observacoes?: string;
  modoPreparo?: string;
  tempoPreparoMinutos?: number;
};

export function FichaTecnicaForm({
  fichaTecnicaId,
  lojaId,
  produtoCardapio,
  ingredientes: initialIngredientes,
  fotos: initialFotos,
  porcoes: initialPorcoes,
  observacoes: initialObservacoes,
  modoPreparo: initialModoPreparo,
  tempoPreparoMinutos: initialTempoPreparoMinutos,
}: FichaTecnicaFormProps) {
  const [ingredientes, setIngredientes] = useState<IngredienteItem[]>(initialIngredientes);
  const [fotos, setFotos] = useState<FichaTecnicaFoto[]>(initialFotos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantidade, setEditQuantidade] = useState("");
  const [editFatorCorrecao, setEditFatorCorrecao] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [ingredienteToDelete, setIngredienteToDelete] = useState<string | null>(null);

  const handleAddIngrediente = async (produto: Produto, quantidade: number, fatorCorrecao: number) => {
    setIsAdding(true);
    const result = await addIngrediente(fichaTecnicaId, {
      produto_ingrediente_id: produto.id,
      quantidade,
      unidade: produto.unidade,
      fator_correcao: fatorCorrecao,
    });

    if (result.success && result.data) {
      // Buscar o produto completo com custo_unitario para adicionar à lista
      // Como não temos o custo no objeto 'produto' passado, vamos recarregar a página
      // ou fazer uma nova busca. Por ora, vamos recarregar:
      window.location.reload();
    } else {
      toast.error(result.error || "Erro ao adicionar ingrediente");
    }
    setIsAdding(false);
  };

  const handleRemoveIngrediente = async () => {
    if (!ingredienteToDelete) return;

    const result = await removeIngrediente(ingredienteToDelete);
    if (result.success) {
      toast.success("Ingrediente removido com sucesso!");
      window.location.reload();
    } else {
      toast.error(result.error || "Erro ao remover ingrediente");
    }
    setIngredienteToDelete(null);
  };

  const handleStartEdit = (item: IngredienteItem) => {
    setEditingId(item.id);
    setEditQuantidade(item.quantidade.toString());
    setEditFatorCorrecao((item.fator_correcao || 1.0).toString());
  };

  const handleSaveEdit = async (itemId: string) => {
    const quantidade = parseFloat(editQuantidade);
    const fatorCorrecao = parseFloat(editFatorCorrecao);

    if (quantidade <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }

    if (fatorCorrecao <= 0) {
      toast.error("Fator de correção deve ser maior que zero");
      return;
    }

    const result = await updateIngrediente(itemId, { quantidade, fator_correcao: fatorCorrecao });
    if (result.success) {
      toast.success("Ingrediente atualizado!");
      window.location.reload();
    } else {
      toast.error(result.error || "Erro ao atualizar ingrediente");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantidade("");
    setEditFatorCorrecao("");
  };

  const excludedIds = ingredientes.map((item) => item.produto_ingrediente_id);

  // Calcular custo total da ficha técnica
  const custoTotal = ingredientes.reduce((total, item) => {
    return total + calcularCustoIngrediente(item);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Informações do Produto de Cardápio */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-2 bg-orange-600 rounded-lg flex-shrink-0">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl truncate">{produtoCardapio.nome}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">{produtoCardapio.codigo}</Badge>
                  <span className="text-xs">·</span>
                  <span className="text-xs">{produtoCardapio.unidade}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                {ingredientes.length}
                <span className="hidden sm:inline ml-1">
                  {ingredientes.length === 1 ? 'ingrediente' : 'ingredientes'}
                </span>
                <span className="sm:hidden ml-1">ingred.</span>
              </Badge>
              {custoTotal > 0 && (
                <Badge variant="default" className="text-xs whitespace-nowrap bg-green-600 hover:bg-green-700">
                  R$ {custoTotal.toFixed(2)}
                </Badge>
              )}
              {fotos.length > 0 && (
                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                  {fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Sistema de Tabs */}
          <Tabs defaultValue="ingredientes" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-auto p-0">
              <TabsTrigger
                value="ingredientes"
                className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent py-3"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Ingredientes</span>
                <span className="sm:hidden">Ingred.</span>
              </TabsTrigger>
              <TabsTrigger
                value="modo-preparo"
                className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent py-3"
              >
                <BookOpen className="h-4 w-4" />
                Preparo
              </TabsTrigger>
              <TabsTrigger
                value="fotos"
                className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent py-3"
              >
                <Camera className="h-4 w-4" />
                Fotos
              </TabsTrigger>
            </TabsList>

        {/* Tab 1: Ingredientes */}
        <TabsContent value="ingredientes" className="space-y-3 p-3 sm:p-6">

      {/* Campo de Busca Compacto */}
      <div className="sticky top-0 bg-white dark:bg-slate-950 z-10 pb-3">
        <IngredienteSelector
          onSelect={handleAddIngrediente}
          excludeIds={excludedIds}
        />
      </div>

      {/* Lista de Ingredientes */}
      {ingredientes.length === 0 ? (
        <div className="text-center py-8 px-4">
          <Package className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum ingrediente adicionado
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Use o campo de busca acima
          </p>
        </div>
      ) : (
        <div className="space-y-2">
              {ingredientes.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {item.produto?.codigo}
                      </Badge>
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {item.produto?.nome}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step="0.001"
                              value={editQuantidade}
                              onChange={(e) => setEditQuantidade(e.target.value)}
                              className="w-24 h-8"
                              autoFocus
                            />
                            <span>{item.unidade}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">F.C.</span>
                            <Input
                              type="number"
                              step="0.001"
                              value={editFatorCorrecao}
                              onChange={(e) => setEditFatorCorrecao(e.target.value)}
                              className="w-20 h-8"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>
                            {item.quantidade} {item.unidade}
                          </span>
                          <span>•</span>
                          <span className={item.fator_correcao && item.fator_correcao !== 1.0 ? "text-orange-600 dark:text-orange-400 font-medium" : ""}>
                            F.C. {item.fator_correcao || 1.0}
                          </span>
                          {item.produto?.custo_unitario && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                R$ {calcularCustoIngrediente(item).toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {editingId === item.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveEdit(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4 text-slate-600" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIngredienteToDelete(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
        </div>
      )}
        </TabsContent>

        {/* Tab 2: Modo de Preparo */}
        <TabsContent value="modo-preparo" className="p-3 sm:p-6">
          <ModoPreparo
            fichaTecnicaId={fichaTecnicaId}
            produtoCardapioId={produtoCardapio.id}
            modoPreparo={initialModoPreparo}
            tempoPreparoMinutos={initialTempoPreparoMinutos}
            porcoes={initialPorcoes}
          />
        </TabsContent>

        {/* Tab 3: Fotos */}
        <TabsContent value="fotos" className="p-3 sm:p-6">
          <FotosManager
            fichaTecnicaId={fichaTecnicaId}
            lojaId={lojaId}
            fotos={fotos}
            onFotosChange={() => {
              // Recarregar fotos após alteração
              // A página pode ser recarregada ou podemos fazer uma busca
            }}
          />
        </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!ingredienteToDelete} onOpenChange={() => setIngredienteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este ingrediente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveIngrediente} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
