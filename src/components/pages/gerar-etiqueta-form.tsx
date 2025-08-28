"use client";

import { useRouter } from "@/hooks/use-router";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  LoaderCircle, 
  Printer, 
  Package, 
  FileText, 
  Calendar, 
  Layers, 
  Settings,
  CheckCircle2,
  Info,
  Hash,
  Building,
  Tag,
  Save,
  Eye,
  Zap
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { gerarEtiqueta, getImpressoras, getTemplates } from "./actions";
import { PrintDialog } from "./print-dialog";

interface IEtiqueta {
  validade: string;
  fornecedor: string;
  lote: string;
  sif: string;
  operador_id?: string | null;
  operador?: string | null;
  produto_id?: string | null;
  impressora_id?: string;
  quantidade?: number;
  template_id?: string;
}

// Importar a interface diretamente do módulo actions
import type { Template } from "./actions";

const INIT_ETIQUETA: IEtiqueta = {
  validade: "",
  fornecedor: "",
  lote: "",
  sif: "",
  operador_id: null,
  produto_id: null,
};

export function GerarEtiquetaForm({ produto }: { produto: any }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printers, setPrinters] = useState<Array<{ id: string; nome: string }>>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formData, setFormData] = useState<IEtiqueta | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  function getParam(property: string) {
    return searchParams.get(property);
  }

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<IEtiqueta>({
    defaultValues: {
      ...INIT_ETIQUETA,
      operador_id: getParam("operadorId"),
      produto_id: getParam("produtoId"),
      operador: getParam("operador"),
      validade: produto?.dias_validade
        ? addDays(new Date(), produto.dias_validade).toISOString().split("T")[0]
        : "",
    },
  });

  const temValidadeAutomatica = produto?.dias_validade && produto.dias_validade > 0;
  const dataValidadeCalculada = temValidadeAutomatica 
    ? addDays(new Date(), produto.dias_validade)
    : null;

  const watchTemplateId = watch("template_id");
  const watchImpressoraId = watch("impressora_id");
  const watchQuantidade = watch("quantidade");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [printersData, templatesData] = await Promise.all([
          getImpressoras(),
          getTemplates(),
        ]);
        setPrinters(printersData);
        setTemplates(templatesData);

        // Auto-selecionar primeiro template e impressora se há apenas um disponível
        if (templatesData.length === 1) {
          setValue("template_id", templatesData[0].id);
          setSelectedTemplate(templatesData[0]);
          
          // Inicializar campos dinâmicos se o template tiver
          if (templatesData[0].campos_personalizados) {
            const newDynamicFields: Record<string, string> = {};
            templatesData[0].campos_personalizados.forEach((field) => {
              newDynamicFields[field.nome] = "";
            });
            setDynamicFields(newDynamicFields);
          }
        }
        if (printersData.length === 1) {
          setValue("impressora_id", printersData[0].id);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erro ao carregar dados");
      }
    };

    loadData();
  }, [setValue]);

  useEffect(() => {
    if (watchTemplateId) {
      const template = templates.find((t) => t.id === watchTemplateId);
      setSelectedTemplate(template || null);

      // Inicializar campos dinâmicos
      if (template?.campos_personalizados) {
        const newDynamicFields: Record<string, string> = {};
        template.campos_personalizados.forEach((field) => {
          newDynamicFields[field.nome] = "";
        });
        setDynamicFields(newDynamicFields);
      }
    }
  }, [watchTemplateId, templates]);

  const onSubmit: SubmitHandler<IEtiqueta> = async (data) => {
    if (!data.template_id) {
      toast.error("Selecione um template");
      return;
    }

    if (!data.impressora_id) {
      toast.error("Selecione uma impressora");
      return;
    }

    if (!data.quantidade || data.quantidade < 1) {
      toast.error("Defina a quantidade de etiquetas");
      return;
    }

    try {
      setLoading(true);
      setLoadingText("Gerando etiquetas...");

      const etiquetaData = {
        ...data,
        campos_dinamicos: dynamicFields,
      };

      const response = await gerarEtiqueta(etiquetaData);
      if (response.error) throw new Error(response.error);

      toast.success(`${data.quantidade} etiqueta(s) enviada(s) para impressão!`);
      setFormData(etiquetaData);
      setShowPrintDialog(true);
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar etiquetas");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

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
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  {produto?.nome || "Produto"}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <Badge variant="secondary" className="font-mono">
                    {produto?.codigo || "SEM CÓDIGO"}
                  </Badge>
                  <span>Unidade: {produto?.unidade || "UN"}</span>
                  {produto?.dias_validade && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Validade: {produto.dias_validade} dias
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Operador</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {getParam("operador") || "Não identificado"}
                </p>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <Printer className="h-3 w-3 mr-1" />
                  Etiquetas
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Configurações de Impressão */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                Configurações de Impressão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template_id" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Template *
                </Label>
                <Select value={watchTemplateId} onValueChange={(value) => setValue("template_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <div>
                            <p>{template.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {template.width}mm × {template.height}mm
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {templates.length === 1 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Template selecionado automaticamente
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="impressora_id" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Impressora *
                </Label>
                <Select value={watchImpressoraId} onValueChange={(value) => setValue("impressora_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar impressora..." />
                  </SelectTrigger>
                  <SelectContent>
                    {printers.map((printer) => (
                      <SelectItem key={printer.id} value={printer.id}>
                        <div className="flex items-center gap-2">
                          <Printer className="h-4 w-4" />
                          {printer.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {printers.length === 1 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Impressora selecionada automaticamente
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Quantidade *
                </Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="1"
                  className="text-lg font-semibold"
                  {...register("quantidade", { 
                    valueAsNumber: true,
                    required: "Quantidade é obrigatória",
                    min: { value: 1, message: "Mínimo 1 etiqueta" },
                    max: { value: 100, message: "Máximo 100 etiquetas" }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações da Etiqueta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-purple-600" />
                Informações da Etiqueta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validade" className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Data de Validade
                    {temValidadeAutomatica && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        Automática
                      </Badge>
                    )}
                  </Label>
                  <div className="space-y-1">
                    <Input
                      id="validade"
                      type="date"
                      disabled={temValidadeAutomatica}
                      className={cn(
                        temValidadeAutomatica && "bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                      )}
                      {...register("validade")}
                    />
                    {temValidadeAutomatica && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Calculada automaticamente: {dataValidadeCalculada && format(dataValidadeCalculada, "dd/MM/yyyy", { locale: ptBR })} 
                        ({produto.dias_validade} dias a partir de hoje)
                      </p>
                    )}
                  </div>
                </div>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="fornecedor" className="flex items-center gap-2">
                  <Building className="h-3 w-3" />
                  Fornecedor
                </Label>
                <Input
                  id="fornecedor"
                  placeholder="Nome do fornecedor"
                  {...register("fornecedor")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sif" className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  SIF
                </Label>
                <Input
                  id="sif"
                  placeholder="Código SIF"
                  {...register("sif")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campos Dinâmicos do Template */}
        {selectedTemplate?.campos_personalizados && selectedTemplate.campos_personalizados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                Campos Personalizados
              </CardTitle>
              <CardDescription>
                Campos específicos do template selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplate.campos_personalizados.map((field) => (
                  <div key={field.nome} className="space-y-2">
                    <Label htmlFor={field.nome} className="capitalize">
                      {field.nome.replace(/[_-]/g, " ")}
                      {field.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.nome}
                      placeholder={field.placeholder || `Digite ${field.nome}`}
                      value={dynamicFields[field.nome] || ""}
                      onChange={(e) => 
                        setDynamicFields(prev => ({
                          ...prev,
                          [field.nome]: e.target.value
                        }))
                      }
                      required={field.obrigatorio}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview das Configurações */}
        {watchTemplateId && watchImpressoraId && watchQuantidade && (
          <Card className="bg-slate-50 dark:bg-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-slate-600" />
                Preview da Impressão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <p><strong>Template:</strong> {selectedTemplate?.nome}</p>
                  <p><strong>Impressora:</strong> {printers.find(p => p.id === watchImpressoraId)?.nome}</p>
                  <p><strong>Quantidade:</strong> {watchQuantidade} etiqueta(s)</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Configurado
                  </Badge>
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
            disabled={loading || isPending}
            className="min-w-[150px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Gerar Etiquetas
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Dialog de impressão */}
      {showPrintDialog && formData && (
        <PrintDialog
          isOpen={showPrintDialog}
          onClose={() => setShowPrintDialog(false)}
          formData={formData}
          template={selectedTemplate}
          printer={printers.find(p => p.id === formData.impressora_id)}
        />
      )}
    </>
  );
}