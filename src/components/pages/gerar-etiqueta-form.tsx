"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useRouter } from "@/hooks/use-router";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
  const [printers, setPrinters] = useState<Array<{ id: string; nome: string }>>(
    []
  );
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formData, setFormData] = useState<IEtiqueta | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>(
    {}
  );
  const router = useRouter();

  function getParam(property: string) {
    return searchParams.get(property);
  }

  const { register, handleSubmit, setValue, watch } = useForm<IEtiqueta>({
    defaultValues: {
      ...INIT_ETIQUETA,
      operador_id: getParam("operadorId"),
      produto_id: getParam("produtoId"),
      operador: getParam("operador"),
      validade: produto.dias_validade
        ? addDays(new Date(), produto.dias_validade).toISOString().split("T")[0]
        : undefined,
    },
  });

  useEffect(() => {
    // Fetch available printers and templates
    const loadData = async () => {
      try {
        const [printersData, templatesData] = await Promise.all([
          getImpressoras(),
          getTemplates(),
        ]);
        setPrinters(printersData);
        setTemplates(templatesData);

        // If there's only one template, select it automatically
        if (templatesData.length === 1) {
          setValue("template_id", templatesData[0].id);
          setSelectedTemplate(templatesData[0]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erro ao carregar dados");
      }
    };
    loadData();
  }, [setValue]);

  // Carregar o template selecionado quando o template_id mudar
  useEffect(() => {
    const templateId = watch("template_id");
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);

        // Inicializar campos dinâmicos vazios para todos os campos do template
        const initialFields: Record<string, string> = {};
        template.campos
          .filter((campo) => campo.fieldType === "dynamic")
          .forEach((campo) => {
            initialFields[campo.name] = "";
          });
        setDynamicFields(initialFields);
      }
    }
  }, [watch("template_id"), templates]);

  const onSubmit: SubmitHandler<IEtiqueta> = async (formValue) => {
    if (!formValue.template_id) {
      toast.error("Selecione um template de etiqueta");
      return;
    }

    setFormData(formValue);
    setShowPrintDialog(true);
  };

  const handlePrint = async (printer: string, quantity: number) => {
    if (!formData) return;

    try {
      setLoading(true);
      setLoadingText("Enviando para impressão...");

      // Preparar os dados para envio
      const requestData: Record<string, any> = {
        ...formData,
        loja_id: produto.loja_id,
        impressora: printer,
        quantidade: quantity,
        produto_nome: produto.nome,
        codigo_produto: produto.codigo,
      };

      await gerarEtiqueta(requestData);

      toast.success("Etiqueta enviada para impressão com sucesso!");
      router.replace("/");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao gerar etiqueta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed top-0 w-screen h-screen z-50 bg-background/90 text-center flex flex-col items-center justify-center",
          {
            hidden: !loading,
          }
        )}
      >
        <LoaderCircle className="animate-spin" />
        {loadingText || "Processando..."}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col max-w-3xl w-full mx-auto"
      >
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">{produto.nome}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mb-4">
          <Label>Template de Impressão</Label>
          <Select
            value={watch("template_id")}
            onValueChange={(value) => setValue("template_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campos padrão */}
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Validade</TableCell>
              <TableCell>
                <Input
                  type="Date"
                  {...register("validade")}
                  readOnly={!!produto.dias_validade}
                  disabled={!!produto.dias_validade}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Fornecedor</TableCell>
              <TableCell>
                <Input type="string" {...register("fornecedor")} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Lote</TableCell>
              <TableCell>
                <Input type="string" {...register("lote")} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SIF</TableCell>
              <TableCell>
                <Input type="string" {...register("sif")} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Campos dinâmicos baseados no template selecionado */}
        {selectedTemplate &&
          selectedTemplate.campos.some((c) => c.fieldType === "dynamic") && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Campos do Template</h3>
              <Table>
                <TableBody>
                  {selectedTemplate.campos
                    .filter((campo) => campo.fieldType === "dynamic")
                    .sort((a, b) => (a.lineNumber || 0) - (b.lineNumber || 0))
                    .map((campo, idx) => (
                      <TableRow key={`${campo.name}-${idx}`}>
                        <TableCell className="font-medium">
                          {campo.name}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={dynamicFields[campo.name] || ""}
                            onChange={(e) => {
                              setDynamicFields({
                                ...dynamicFields,
                                [campo.name]: e.target.value,
                              });
                            }}
                            placeholder={
                              campo.defaultValue || `Valor para ${campo.name}`
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}

        {/* Campos dinâmicos baseados no template selecionado */}
        {selectedTemplate &&
          selectedTemplate.campos.some((c) => c.fieldType === "dynamic") && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Campos do Template</h3>
              <Table>
                <TableBody>
                  {selectedTemplate.campos
                    .filter((campo) => campo.fieldType === "dynamic")
                    .sort((a, b) => (a.lineNumber || 0) - (b.lineNumber || 0))
                    .map((campo, idx) => (
                      <TableRow key={`${campo.name}-${idx}`}>
                        <TableCell className="font-medium">
                          {campo.name}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={dynamicFields[campo.name] || ""}
                            onChange={(e) => {
                              setDynamicFields({
                                ...dynamicFields,
                                [campo.name]: e.target.value,
                              });
                            }}
                            placeholder={
                              campo.defaultValue || `Valor para ${campo.name}`
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}

        <Button className="m-8" type="submit">
          Concluir
        </Button>
      </form>

      <PrintDialog
        open={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        onConfirm={handlePrint}
        printers={printers}
      />
    </>
  );
}
