"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { IEntradaInsumo, saveProducao } from "@/app/entrada-insumo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const INIT_RECEBIMENTO = {
  peso_bruto: null,
  data_recebimento: null,
  fornecedor: "",
  nota_fiscal: "",
  sif: "",
  temperatura: "",
  lote: "",
  validade: "",
  operador: "",
  conformidade_transporte: "",
  conformidade_embalagem: "",
  conformidade_produtos: "",
  observacoes: "",
  produto_nome: ""
};

export function EntradaInsumoForm({
  produto,
}: {
  produto: any;
}) {
  const searchParams = useSearchParams();
  // const params = new URLSearchParams(searchParams);

  function getParam(property: string) {
    return searchParams.get(property);
  }

  const [producao, setProducao] = useState<IEntradaInsumo | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<IEntradaInsumo>({
    defaultValues: {
      ...INIT_RECEBIMENTO,
    }
  });

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

  // useEffect(() => {
  //   watch((value, { name, type }) => {
  //     if (type === "change" && name?.includes("items.")) {
  //       setValue(
  //         "peso_liquido",
  //         value.items!.reduce((acc, item) => (acc += item.peso || 0), 0)
  //       );
  //     }
  //   });
  // }, [watch]);

  const onSubmit: SubmitHandler<IEntradaInsumo> = (data) => {
    const producao: IEntradaInsumo = {
      ...data,
      operador_id: getParam("operadorId"),
      operador: getParam("operador"),
      setor: getParam("setor"),
      produto: getParam("produto"),
      produto_nome: getParam("produtoDesc"),
    };
    
    console.log(producao);

    setProducao(producao);
  };

  const onSubmitFormAfterConfirmation = async () => {
    console.log("ACAO PARA SER DISPARADA PARA O SUPABASE OU API");
    const {produto_nome, operador, ...toSave} = producao || INIT_RECEBIMENTO;
    console.log(JSON.stringify(toSave, null, 2));
    const resulado = await saveProducao(toSave!);
    console.log("resulado ", resulado)

    //redirect nao funciona :(
    // return redirect("/")
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col max-w-3xl w-full mx-auto"
      >
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">{produto.nome}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder={""}
                  {...register("peso_bruto", { valueAsNumber: true })}
                />
              </TableCell>
              <TableCell>{produto.unidade}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-small">Data</TableCell>
              <TableCell> <Input type="Date" {...register("data_recebimento")} /> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Fornecedor</TableCell>
              <TableCell> <Input type="string" {...register("fornecedor")} /> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">NF</TableCell>
              <TableCell> <Input type="string" {...register("nota_fiscal")} /> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SIF</TableCell>
              <TableCell> <Input type="string" {...register("sif")} /> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Temp Cº</TableCell>
              <TableCell> <Input type="string" {...register("temperatura")} /> </TableCell>
            </TableRow>
            <TableRow>  
              <TableCell className="font-medium">Lote</TableCell>
              <TableCell> <Input type="string" {...register("lote")} /> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Validade</TableCell>
              <TableCell> <Input type="Date" {...register("validade")} /> </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table className="border-t">
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>CONF</TableHead>
              <TableHead>N. CONF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
                <TableCell className="font-medium">Transporte</TableCell>
                <TableCell className="font-small"> <Input type="radio" value="C" {...register("conformidade_transporte")} /> </TableCell>
                <TableCell className="font-small"> <Input type="radio" value="N" {...register("conformidade_transporte")} /> </TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">Embalagem</TableCell>
                <TableCell className="font-small"> <Input type="radio" value="C" {...register("conformidade_embalagem")} /> </TableCell>
                <TableCell className="font-small"> <Input type="radio" value="N" {...register("conformidade_embalagem")} /> </TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">Produtos</TableCell>
                <TableCell className="font-small"> <Input type="radio" value="C" {...register("conformidade_produtos")} /> </TableCell>
                <TableCell className="font-small"> <Input type="radio" value="N" {...register("conformidade_produtos")} /> </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Observações</TableCell>
              <TableCell> <Input type="string" {...register("observacoes")} /> </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Button className="m-8" type="submit">
          Enviar
        </Button>
      </form>

      <Drawer
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
                    {/* {producao!.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>{item.peso}</TableCell>
                      </TableRow>
                    ))} */}
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
      </Drawer>
    </>
  );
}
