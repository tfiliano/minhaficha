"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Inputs, saveProducao } from "@/app/(app)/producao/actions";
import { useRouter } from "@/hooks/use-router";
import { cn } from "@/lib/utils";
import { 
  LoaderCircle, 
  Factory, 
  Package, 
  Calculator, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Scale,
  Layers,
  TrendingUp,
  Save,
  Eye,
  Package2,
  Hash
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const INIT_PRODUCAO = {
  items: [],
  peso_liquido: 0,
  peso_bruto: null,
  peso_perda: 0,
  fator_correcao: 0,
  quantidade: 1,
  produto_nome: "",
  produto_id: null,
  grupo_id: null,
  operador: "",
};

export function ProducaoForm({
  items,
  produto,
}: {
  items: any[];
  produto: any;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  function getParam(property: string) {
    return searchParams.get(property);
  }

  const [producao, setProducao] = useState<Inputs | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      ...INIT_PRODUCAO,
      items,
      operador_id: getParam("operadorId"),
      operador: getParam("operador"),
      setor: getParam("setor"),
      produto: getParam("produto"),
      produto_id: getParam("produtoId"),
      grupo_id: produto.grupo_id,
      produto_nome: getParam("produtoDesc"),
    },
  });

  const watchPesoBruto = watch("peso_bruto");
  const watchPesoLiquido = watch("peso_liquido");
  const watchFatorCorrecao = watch("fator_correcao");
  const watchItems = watch("items");

  function round(value: number) {
    const roundedValue = Math.round((value + Number.EPSILON) * 100) / 100;
    return roundedValue;
  }

  function toFixed(num: number, fixed: number = 2) {
    if (!num) return 0;
    var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
    const value = num || 0;
    const default_return = ["0"];
    return parseFloat((value.toString().match(re) || default_return)[0]);
  }

  useEffect(() => {
    watch((value, { name, type }) => {
      if (type === "change" && name?.includes("items.")) {
        const peso_liquido = value.items!.reduce((acc, item) => (acc += item.peso || 0), 0);
        setValue("peso_liquido", peso_liquido);
        
        const bruto = value.peso_bruto || 0;
        const liquido = peso_liquido || 0.01;
        const fator_correcao = bruto > 0 && liquido > 0 ? bruto / liquido : 0;

        setValue("peso_perda", toFixed(bruto - liquido));
        setValue("fator_correcao", toFixed(fator_correcao));
      }
    });
  }, [watch, setValue]);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const producao: Inputs = {
      ...data,
    };
    producao.items = producao.items
      .filter((i) => i.quantidade)
      .map((i) => {
        return {
          id: i.id,
          codigo: i.codigo,
          nome: i.nome,
          quantidade: i.quantidade,
          peso: i.peso,
          peso_medio: round(i.peso / i.quantidade),
        };
      });

    setProducao(producao);
  };

  const onSubmitFormAfterConfirmation = async () => {
    try {
      setLoadingText("Salvando produção...");
      setLoading(true);
      
      const { produto_nome, operador, ...toSave } = producao || INIT_PRODUCAO;
      const response = await saveProducao(toSave!);
      
      if (response.error) throw response.error;

      toast.success("Produção registrada com sucesso!");
      router.replace("/");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar produção");
    } finally {
      setLoading(false);
    }
  };

  const totalItemsUsados = watchItems?.filter(item => (item?.peso || 0) > 0).length || 0;
  const pesoPerda = watchPesoBruto ? toFixed(watchPesoBruto - watchPesoLiquido) : 0;
  const percentualPerda = watchPesoBruto > 0 ? ((pesoPerda / watchPesoBruto) * 100).toFixed(1) : "0.0";

  return (
    <>
      {/* Loading Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-300",
          loading ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
          <LoaderCircle className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {loadingText || "Processando..."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto space-y-6">
        {/* Header com produto principal */}
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Factory className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  {produto?.nome || "Produto"}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <Badge variant="secondary" className="font-mono">
                    {produto?.codigo || "SEM CÓDIGO"}
                  </Badge>
                  <span>Unidade: {produto?.unidade || "UN"}</span>
                </CardDescription>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Operador</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {getParam("operador") || "Não identificado"}
                </p>
                <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                  <Package className="h-3 w-3 mr-1" />
                  {items?.length || 0} insumos
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Quantidade *
                  </Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    placeholder="1"
                    className="text-lg font-semibold"
                    {...register("quantidade", { 
                      valueAsNumber: true,
                      required: "Quantidade é obrigatória",
                      min: { value: 1, message: "Quantidade deve ser no mínimo 1" }
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="peso_bruto" className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Peso Bruto *
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="peso_bruto"
                      type="number"
                      step={0.001}
                      placeholder="0.000"
                      className="text-lg font-semibold"
                      {...register("peso_bruto", { 
                        valueAsNumber: true,
                        required: "Peso bruto é obrigatório"
                      })}
                    />
                    <Badge variant="outline" className="px-3 py-2">
                      {produto?.unidade || "KG"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Peso Líquido Calculado */}
            {watchPesoLiquido > 0 && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 font-medium">
                    <Layers className="h-4 w-4" />
                    Peso Líquido (calculado)
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {watchPesoLiquido.toFixed(3)}
                    </span>
                    <Badge variant="outline">{produto?.unidade || "KG"}</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insumos Utilizados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-blue-600" />
              Insumos Utilizados
            </CardTitle>
            <CardDescription>
              Configure as quantidades e pesos dos insumos utilizados na produção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="space-y-3">
                    {/* Nome do produto */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{item.nome}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.codigo}</p>
                    </div>
                    
                    {/* Campos de input em layout mobile-friendly */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Quantidade</Label>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            step="any"
                            placeholder="0"
                            className="text-center text-sm"
                            {...register(`items.${index}.quantidade`, {
                              valueAsNumber: true,
                            })}
                          />
                          <Badge variant="outline" className="px-2 text-xs whitespace-nowrap">
                            {item.unidade}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Peso</Label>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            step="any"
                            placeholder="0.000"
                            className="text-center text-sm"
                            {...register(`items.${index}.peso`, {
                              valueAsNumber: true,
                            })}
                          />
                          <Badge variant="outline" className="px-2 text-xs">KG</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum insumo encontrado para este produto</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Produção */}
        {(watchPesoBruto > 0 || watchPesoLiquido > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-purple-600" />
                Métricas de Produção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-purple-600 dark:text-purple-400 truncate">Fator de Correção</p>
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-300 truncate">
                        {watchFatorCorrecao?.toFixed(4) || "0.0000"}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-purple-500 opacity-50 flex-shrink-0 ml-2" />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-amber-600 dark:text-amber-400 truncate">Peso de Perda</p>
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-300 truncate">
                        {pesoPerda} KG
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 truncate">
                        ({percentualPerda}% do bruto)
                      </p>
                    </div>
                    <Scale className="h-6 w-6 text-amber-500 opacity-50 flex-shrink-0 ml-2" />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-600 dark:text-blue-400 truncate">Insumos Usados</p>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {totalItemsUsados} / {items.length}
                      </p>
                    </div>
                    <Package2 className="h-6 w-6 text-blue-500 opacity-50 flex-shrink-0 ml-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.replace("/")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="min-w-[150px] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            Revisar Produção
          </Button>
        </div>
      </form>

      {/* Dialog de confirmação */}
      <Dialog open={!!producao} onOpenChange={(open) => !open && setProducao(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Confirmar Produção
            </DialogTitle>
            <DialogDescription>
              Verifique os dados antes de finalizar o registro de produção
            </DialogDescription>
          </DialogHeader>
          
          {producao && (
            <div className="space-y-4">
              {/* Resumo do produto */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{producao.produto_nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Quantidade:</span>
                      <span className="ml-2 font-semibold">{producao.quantidade}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Peso Bruto:</span>
                      <span className="ml-2 font-semibold">{producao.peso_bruto} KG</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Peso Líquido:</span>
                      <span className="ml-2 font-semibold">{producao.peso_liquido} KG</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Fator de Correção:</span>
                      <span className="ml-2 font-semibold">{producao.fator_correcao}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insumos utilizados */}
              {producao.items && producao.items.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Insumos Utilizados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {producao.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <span className="text-sm font-medium">{item.nome}</span>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {item.quantidade} un • {item.peso} KG
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setProducao(null)}>
              Cancelar
            </Button>
            <Button
              onClick={onSubmitFormAfterConfirmation}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Confirmar Produção
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}