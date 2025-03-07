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
  produto_id?: string | null;
  impressora_id?: string;
  quantidade?: number;
  template_id?: string;
}

interface Template {
  id: string;
  nome: string;
  zpl: string;
  campos: Array<{
    name: string;
    x: number;
    y: number;
    fontSize: number;
  }>;
}

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
  const router = useRouter();

  function getParam(property: string) {
    return searchParams.get(property);
  }

  const { register, handleSubmit, setValue, watch } = useForm<IEtiqueta>({
    defaultValues: {
      ...INIT_ETIQUETA,
      operador_id: getParam("operadorId"),
      produto_id: getParam("produtoId"),

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
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erro ao carregar dados");
      }
    };
    loadData();
  }, [setValue]);

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

      await gerarEtiqueta({
        ...formData,
        impressora_id: printer,
        quantidade: quantity,
        produto_nome: produto.nome,
      });

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
