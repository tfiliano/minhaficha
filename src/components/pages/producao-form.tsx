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

import { Inputs, saveProducao } from "@/app/producao/actions";
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

const INIT_PRODUCAO = {
  items:[],
  peso_liquido: 0,
  peso_bruto: null,
  peso_perda: 0,
  fator_correcao: 0,
  produto_nome: "",
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
  // const params = new URLSearchParams(searchParams);

  function getParam(property: string) {
    return searchParams.get(property);
  }

  const [producao, setProducao] = useState<Inputs | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<Inputs>({
    defaultValues: {
      ...INIT_PRODUCAO,
      items,
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

  useEffect(() => {
    watch((value, { name, type }) => {
      if (type === "change" && name?.includes("items.")) {
        setValue(
          "peso_liquido",
          value.items!.reduce((acc, item) => (acc += item.peso || 0), 0)
        );
        const bruto = value.peso_bruto || 0;
        const liquido = value.peso_liquido || 0.01;
        const fator_correcao = bruto / liquido;

        setValue("peso_perda", toFixed(bruto - liquido));
        setValue("fator_correcao", toFixed(fator_correcao));
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
    console.log(producao);

    setProducao(producao);
  };

  const onSubmitFormAfterConfirmation = async () => {
    console.log("ACAO PARA SER DISPARADA PARA O SUPABASE OU API");
    const {produto_nome, operador, ...toSave} = producao || INIT_PRODUCAO;
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

            <TableRow>
              <TableCell className="font-small">LÍQUIDO</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder=""
                  readOnly
                  {...register("peso_liquido")}
                />
              </TableCell>
              <TableCell>{produto.unidade}</TableCell>
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
                  {...register("fator_correcao", { valueAsNumber: true })}
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
      </Drawer>
    </>
  );
}
