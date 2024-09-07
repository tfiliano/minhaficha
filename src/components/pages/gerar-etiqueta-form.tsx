"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { toast } from "sonner";

import { IEntradaInsumo, saveRecebimento } from "@/app/entrada-insumo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "@/hooks/use-router";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const INIT_RECEBIMENTO = {
  // peso_bruto: 2.5,
  // data_recebimento: new Date(),
  // fornecedor: "ZEH",
  // nota_fiscal: "001",
  // sif: "SIF 01",
  // temperatura: "28.5",
  // lote: "LOTE 01",
  // validade: new Date(),
  // //operador: "MARIA",
  // conformidade_transporte: "C",
  // conformidade_embalagem: "N",
  // conformidade_produtos: "C",
  // observacoes: "OBSERVACAO",
  // //produto_nome: "CONTRA",
  peso_bruto: null,
  data_recebimento: null,
  fornecedor: "",
  nota_fiscal: "",
  sif: "",
  temperatura: "",
  lote: "",
  validade: "",
  // operador: "",
  conformidade_transporte: "",
  conformidade_embalagem: "",
  conformidade_produtos: "",
  observacoes: "",
  // produto_nome: ""
};

export function GerarEtiquetaForm({ produto }: { produto: any }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const router = useRouter();
  // const params = new URLSearchParams(searchParams);

  function getParam(property: string) {
    return searchParams.get(property);
  }

  const [recebimento, setRecebimento] = useState<IEntradaInsumo | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<IEntradaInsumo>({
    defaultValues: {
      ...INIT_RECEBIMENTO,
      operador_id: getParam("operadorId"),
      produto: getParam("produto"),
      produto_id: getParam("produtoId"),
    },
  });

  const onSubmit: SubmitHandler<IEntradaInsumo> = async (formValue) => {
    try {
      //PRECISEI REALIZAR UM DELETE EM ALGUMS CAMPOS QUE NÃO ESTAO NA TABLE DO SUPABASE;
      // OPERADOR
      // PRODUTO_NAME
      setLoading(true);
      console.log("TODO: salvar etiqueta e mandar imprimir")
    //   const response = await saveRecebimento({ ...formValue });

    //   if (response.error) throw response.error;

      router.replace("/");
    } catch (error: any) {
      toast.error(error?.message);
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

        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Validade</TableCell>
              <TableCell>
                <Input type="Date" {...register("validade")} />
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

      {/* <Drawer
        open={!!producao}
        onOpenChange={(e) => {
          if (e === false) setProducao(null);
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Confirmação</DrawerTitle>
            <DrawerDescription>
              Verifique os dados antes de confirmar
            </DrawerDescription>
          </DrawerHeader>
          <div>
            {producao && (
              <>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>{producao!.produto_nome}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{producao!.peso_bruto} Kg</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PRODUTO</TableHead>
                      <TableHead>UN</TableHead>
                      <TableHead>PESO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {producao!.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>{item.peso}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
          <DrawerFooter>
            <Button onClick={onSubmitFormAfterConfirmation}>Enviar</Button>
            <DrawerClose>
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer> */}
    </>
  );
}
