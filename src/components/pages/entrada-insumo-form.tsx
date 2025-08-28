"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  IEntradaInsumo,
  saveRecebimento,
} from "@/app/(app)/entrada-insumo/actions";
import { useRouter } from "@/hooks/use-router";
import { cn } from "@/lib/utils";
import { 
  LoaderCircle, 
  Package, 
  Truck, 
  FileText, 
  Thermometer, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  ClipboardList,
  Save,
  AlertTriangle,
  Info,
  Hash,
  Building,
  PackageCheck
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const INIT_RECEBIMENTO = {
  peso_bruto: null,
  data_recebimento: null,
  fornecedor: "",
  nota_fiscal: "",
  sif: "",
  temperatura: "",
  lote: "",
  validade: "",
  conformidade_transporte: "",
  conformidade_embalagem: "",
  conformidade_produtos: "",
  observacoes: "",
};

export function EntradaInsumoForm({ produto }: { produto: any }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const router = useRouter();

  function getParam(property: string) {
    return searchParams.get(property);
  }

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<IEntradaInsumo>({
    defaultValues: {
      ...INIT_RECEBIMENTO,
      operador_id: getParam("operadorId"),
      produto: getParam("produto"),
      produto_id: getParam("produtoId"),
    },
  });

  const watchConformidadeTransporte = watch("conformidade_transporte");
  const watchConformidadeEmbalagem = watch("conformidade_embalagem");
  const watchConformidadeProdutos = watch("conformidade_produtos");

  const onSubmit: SubmitHandler<IEntradaInsumo> = async (formValue) => {
    try {
      setLoading(true);
      setLoadingText("Salvando entrada de insumo...");
      const response = await saveRecebimento({ ...formValue });

      if (response.error) throw response.error;

      toast.success("Entrada de insumo registrada com sucesso!");
      router.replace("/");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar entrada");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const conformidadeCount = [
    watchConformidadeTransporte,
    watchConformidadeEmbalagem, 
    watchConformidadeProdutos
  ].filter(c => c === "C").length;

  const naoConformidadeCount = [
    watchConformidadeTransporte,
    watchConformidadeEmbalagem,
    watchConformidadeProdutos
  ].filter(c => c === "N").length;

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
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {loadingText || "Processando..."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-6">
        {/* Header com informações do produto */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  {produto?.nome || "Produto"}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <Badge variant="secondary" className="font-mono">
                    {produto?.codigo || "SEM CÓDIGO"}
                  </Badge>
                  <span>Unidade: {produto?.unidade || "KG"}</span>
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Operador</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {getParam("operador") || "Não identificado"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="peso_bruto" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
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
                      required: "Peso é obrigatório"
                    })}
                  />
                  <Badge variant="outline" className="px-3 py-2">
                    {produto?.unidade || "KG"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Recebimento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados da Entrega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                Dados da Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_recebimento" className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Data/Hora *
                  </Label>
                  <Input
                    id="data_recebimento"
                    type="datetime-local"
                    {...register("data_recebimento", {
                      required: "Data é obrigatória"
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nota_fiscal" className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Nota Fiscal
                  </Label>
                  <Input
                    id="nota_fiscal"
                    placeholder="Número da NF"
                    {...register("nota_fiscal")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fornecedor" className="flex items-center gap-2">
                  <Building className="h-3 w-3" />
                  Fornecedor *
                </Label>
                <Input
                  id="fornecedor"
                  placeholder="Nome do fornecedor"
                  {...register("fornecedor", {
                    required: "Fornecedor é obrigatório"
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sif" className="flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    SIF
                  </Label>
                  <Input
                    id="sif"
                    placeholder="Código SIF"
                    {...register("sif")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperatura" className="flex items-center gap-2">
                    <Thermometer className="h-3 w-3" />
                    Temperatura (°C)
                  </Label>
                  <Input
                    id="temperatura"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    {...register("temperatura")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rastreabilidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                Rastreabilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lote" className="flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  Lote
                </Label>
                <Input
                  id="lote"
                  placeholder="Código do lote"
                  {...register("lote")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validade" className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Data de Validade
                </Label>
                <Input
                  id="validade"
                  type="date"
                  {...register("validade")}
                />
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Conformidades */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-amber-600" />
                Análise de Conformidade
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                {conformidadeCount > 0 && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-600 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {conformidadeCount} Conforme{conformidadeCount > 1 ? 's' : ''}
                  </Badge>
                )}
                {naoConformidadeCount > 0 && (
                  <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    {naoConformidadeCount} Não Conforme{naoConformidadeCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>
              Avalie a conformidade dos itens verificados no recebimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Transporte */}
              <div className="space-y-3">
                <Label className="font-medium flex items-center gap-2 text-base">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Transporte
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={watchConformidadeTransporte === "C" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1 h-10",
                      watchConformidadeTransporte === "C" 
                        ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500" 
                        : "hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/10"
                    )}
                    onClick={() => setValue("conformidade_transporte", "C")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Conforme
                  </Button>
                  <Button
                    type="button"
                    variant={watchConformidadeTransporte === "N" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1 h-10",
                      watchConformidadeTransporte === "N" 
                        ? "bg-red-500 hover:bg-red-600 border-red-500" 
                        : "hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/10"
                    )}
                    onClick={() => setValue("conformidade_transporte", "N")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Não Conforme
                  </Button>
                </div>
              </div>

              {/* Embalagem */}
              <div className="space-y-3">
                <Label className="font-medium flex items-center gap-2 text-base">
                  <Package className="h-5 w-5 text-purple-600" />
                  Embalagem
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={watchConformidadeEmbalagem === "C" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1 h-10",
                      watchConformidadeEmbalagem === "C" 
                        ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500" 
                        : "hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/10"
                    )}
                    onClick={() => setValue("conformidade_embalagem", "C")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Conforme
                  </Button>
                  <Button
                    type="button"
                    variant={watchConformidadeEmbalagem === "N" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1 h-10",
                      watchConformidadeEmbalagem === "N" 
                        ? "bg-red-500 hover:bg-red-600 border-red-500" 
                        : "hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/10"
                    )}
                    onClick={() => setValue("conformidade_embalagem", "N")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Não Conforme
                  </Button>
                </div>
              </div>

              {/* Produtos */}
              <div className="space-y-3">
                <Label className="font-medium flex items-center gap-2 text-base">
                  <PackageCheck className="h-5 w-5 text-amber-600" />
                  Produtos
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={watchConformidadeProdutos === "C" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1 h-10",
                      watchConformidadeProdutos === "C" 
                        ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500" 
                        : "hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/10"
                    )}
                    onClick={() => setValue("conformidade_produtos", "C")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Conforme
                  </Button>
                  <Button
                    type="button"
                    variant={watchConformidadeProdutos === "N" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1 h-10",
                      watchConformidadeProdutos === "N" 
                        ? "bg-red-500 hover:bg-red-600 border-red-500" 
                        : "hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/10"
                    )}
                    onClick={() => setValue("conformidade_produtos", "N")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Não Conforme
                  </Button>
                </div>
              </div>
            </div>

            {naoConformidadeCount > 0 && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-700 dark:text-amber-300">
                      Não conformidades detectadas
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {naoConformidadeCount} item{naoConformidadeCount > 1 ? 'ns' : ''} não conforme{naoConformidadeCount > 1 ? 's' : ''}. 
                      Documente os problemas encontrados nas observações abaixo.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-slate-600" />
              Observações
            </CardTitle>
            <CardDescription>
              Documente informações adicionais sobre o recebimento
              {naoConformidadeCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {" "}• Obrigatório para não conformidades
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                id="observacoes"
                placeholder={
                  naoConformidadeCount > 0 
                    ? "Descreva detalhadamente os problemas encontrados nas não conformidades..."
                    : "Observações adicionais sobre o recebimento..."
                }
                rows={4}
                className={cn(
                  naoConformidadeCount > 0 && "border-amber-300 dark:border-amber-700 focus:border-amber-400"
                )}
                {...register("observacoes", {
                  ...(naoConformidadeCount > 0 && {
                    required: "Observações são obrigatórias quando há não conformidades"
                  })
                })}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                💡 <strong>Dica:</strong> Inclua detalhes sobre condições de transporte, estado das embalagens, 
                aparência dos produtos, temperatura no momento do recebimento, etc.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Submit */}
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
            disabled={loading}
            className="min-w-[150px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Entrada
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}