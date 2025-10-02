"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  observacoes?: string;
  produto?: {
    id: string;
    codigo: string;
    nome: string;
    unidade: string;
    grupo: string;
  };
};

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
  const [isAdding, setIsAdding] = useState(false);

  const handleAddIngrediente = async (produto: Produto, quantidade: number) => {
    setIsAdding(true);
    const result = await addIngrediente(fichaTecnicaId, {
      produto_ingrediente_id: produto.id,
      quantidade,
      unidade: produto.unidade,
    });

    if (result.success && result.data) {
      // Atualizar lista localmente
      setIngredientes([
        ...ingredientes,
        {
          ...result.data,
          produto: {
            id: produto.id,
            codigo: produto.codigo,
            nome: produto.nome,
            unidade: produto.unidade,
            grupo: produto.grupo,
          },
        },
      ]);
      toast.success("Ingrediente adicionado com sucesso!");
    } else {
      toast.error(result.error || "Erro ao adicionar ingrediente");
    }
    setIsAdding(false);
  };

  const handleRemoveIngrediente = async (itemId: string) => {
    const result = await removeIngrediente(itemId);
    if (result.success) {
      // Atualizar lista localmente
      setIngredientes(ingredientes.filter((item) => item.id !== itemId));
      toast.success("Ingrediente removido com sucesso!");
    } else {
      toast.error(result.error || "Erro ao remover ingrediente");
    }
  };

  const handleStartEdit = (item: IngredienteItem) => {
    setEditingId(item.id);
    setEditQuantidade(item.quantidade.toString());
  };

  const handleSaveEdit = async (itemId: string) => {
    const quantidade = parseFloat(editQuantidade);
    if (quantidade <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }

    const result = await updateIngrediente(itemId, { quantidade });
    if (result.success) {
      // Atualizar lista localmente
      setIngredientes(
        ingredientes.map((item) =>
          item.id === itemId ? { ...item, quantidade } : item
        )
      );
      setEditingId(null);
      setEditQuantidade("");
      toast.success("Quantidade atualizada!");
    } else {
      toast.error(result.error || "Erro ao atualizar quantidade");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantidade("");
  };

  const excludedIds = ingredientes.map((item) => item.produto_ingrediente_id);

  return (
    <div className="space-y-6">
      {/* Informações do Produto de Cardápio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              {produtoCardapio.nome}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-base">
                {ingredientes.length} {ingredientes.length === 1 ? 'ingrediente' : 'ingredientes'}
              </Badge>
              {fotos.length > 0 && (
                <Badge variant="secondary" className="text-base">
                  {fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <Badge variant="outline">{produtoCardapio.codigo}</Badge>
            <span>Unidade: {produtoCardapio.unidade}</span>
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Tabs */}
      <Tabs defaultValue="ingredientes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ingredientes" className="gap-2">
            <Package className="h-4 w-4" />
            Ingredientes
          </TabsTrigger>
          <TabsTrigger value="modo-preparo" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Modo de Preparo
          </TabsTrigger>
          <TabsTrigger value="fotos" className="gap-2">
            <Camera className="h-4 w-4" />
            Fotos
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ingredientes */}
        <TabsContent value="ingredientes" className="space-y-6 mt-6">

      {/* Adicionar Ingrediente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Ingrediente</CardTitle>
        </CardHeader>
        <CardContent>
          <IngredienteSelector
            onSelect={handleAddIngrediente}
            excludeIds={excludedIds}
          />
        </CardContent>
      </Card>

      {/* Lista de Ingredientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Ingredientes ({ingredientes.length})</span>
            {ingredientes.length > 0 && (
              <Badge variant="secondary">
                Total de ingredientes na receita
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ingredientes.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                Nenhum ingrediente adicionado ainda
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Use o campo de busca acima para adicionar ingredientes
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {ingredientes.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="shrink-0">
                        {item.produto?.codigo}
                      </Badge>
                      <span className="font-medium text-slate-900 dark:text-white truncate">
                        {item.produto?.nome}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.001"
                            value={editQuantidade}
                            onChange={(e) => setEditQuantidade(e.target.value)}
                            className="w-32 h-8"
                            autoFocus
                          />
                          <span>{item.unidade}</span>
                        </div>
                      ) : (
                        <span>
                          {item.quantidade} {item.unidade}
                        </span>
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
                          onClick={() => handleRemoveIngrediente(item.id)}
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
        </CardContent>
      </Card>
        </TabsContent>

        {/* Tab 2: Modo de Preparo */}
        <TabsContent value="modo-preparo" className="mt-6">
          <ModoPreparo
            fichaTecnicaId={fichaTecnicaId}
            produtoCardapioId={produtoCardapio.id}
            modoPreparo={initialModoPreparo}
            tempoPreparoMinutos={initialTempoPreparoMinutos}
          />
        </TabsContent>

        {/* Tab 3: Fotos */}
        <TabsContent value="fotos" className="mt-6">
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
    </div>
  );
}
