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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Inputs = {
  items: any[];
  pesoBruto: number;
  pesoLiquido: number;
  pesoPerda: number;
  fatorCorrecao: number;

  produto_nome?: string | null;
  produto_id?: string | null;
  produto?: string | null;
  setor?: string | null;
  operador?: string | null;
  operador_id?: string | null;
};

export function ProducaoForm({
  items,
  produto,
}: {
  items: any[];
  produto: any;
}) {
  const searchParams = useSearchParams();
  // const params = new URLSearchParams(searchParams);

  function getParam(property: string) {
    return searchParams.get(property);
  }

  const [producao, setProducao] = useState<Inputs | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<Inputs>({
    defaultValues: {
      items,
      pesoLiquido: 0,
      pesoBruto: 0,
      pesoPerda: 0,
      fatorCorrecao: 0,
    },
  });

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
        setValue(
          "pesoLiquido",
          value.items!.reduce((acc, item) => (acc += item.peso || 0), 0)
        );
        setValue("pesoPerda", toFixed(value.pesoBruto! - value.pesoLiquido!));
        const fatorCorrecao =
          (value.pesoBruto || 0) / (value.pesoLiquido || 0.1);
        setValue("fatorCorrecao", toFixed(fatorCorrecao));
      }
    });
  }, [watch]);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const producao: Inputs = {
      ...data,
      operador_id: getParam("operadorId"),
      operador: getParam("operador"),
      setor: getParam("setor"),
      produto: getParam("produto"),
      produto_nome: getParam("produtoDesc"),
    };
    producao.items = producao.items.filter((i) => i.quantidade);
    console.log(producao);

    setProducao(producao);
  };

  const onSubmitFormAfterConfirmation = async () => {
    const data = producao;
    console.log("ACAO PARA SER DISPARADA PARA O SUPABASE OU API");
    console.log(JSON.stringify(data, null, 2));
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
              <TableCell>{produto.unidade}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder={""}
                  {...register("pesoBruto", { valueAsNumber: true })}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">LÍQUIDO</TableCell>
              <TableCell>{produto.unidade}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder=""
                  readOnly
                  {...register("pesoLiquido")}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Table className="border-t">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">PRODUTO</TableHead>
              <TableHead>UN</TableHead>
              <TableHead>PORÇÃO</TableHead>
              <TableHead>PESO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nome}</TableCell>
                <TableCell>{item.unidade}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder={item.unidade}
                    pattern="^[$\-\s]*[\d\,]*?([\.]\d{0,10})?\s*$"
                    {...register(`items.${index}.quantidade`, {
                      valueAsNumber: true,
                    })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    placeholder="KG"
                    pattern="^[$\-\s]*[\d\,]*?([\.]\d{0,10})?\s*$"
                    step="any"
                    {...register(`items.${index}.peso`, {
                      valueAsNumber: true,
                    })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Fator de Correção</TableCell>
              <TableCell className="font-medium">
                <Input
                  type="number"
                  placeholder=""
                  readOnly
                  {...register("fatorCorrecao", { valueAsNumber: true })}
                />
              </TableCell>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PRODUTO</TableHead>
                    <TableHead>UN</TableHead>
                    <TableHead>PESO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{producao!.produto_nome}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{producao!.pesoBruto}</TableCell>
                  </TableRow>

                  {producao!.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>{item.peso}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
