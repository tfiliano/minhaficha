"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { Title } from "../layout";

type Inputs = {
  items: any[];
  pesoBruto: number;
  pesoLiquido: number;
  pesoPerda: number;
  fatorCorrecao: number;
};

export function ProducaoForm({
  items,
  produto,
}: {
  items: any[];
  produto: any;
}) {
  // const params = new URLSearchParams(searchParams);
  const params = useSearchParams();
  const [visualizarConfirmacao, setVisualizarConfirmacao] = useState<boolean>(false);
  const [producao, setProducao] = useState<Inputs|null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<Inputs>({
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
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    // console.log(num, re, num.toString().match(re))
    return parseFloat(((num || 0).toString().match(re) || [0])[0]);
}

  useEffect(() => {
    watch((value, { name, type }) => {
      if (type === "change" && name?.includes("items.")) {
        setValue(
          "pesoLiquido",
          value.items!.reduce((acc, item) => (acc += item.peso || 0), 0)
        );
        setValue("pesoPerda", toFixed(value.pesoBruto! - value.pesoLiquido!));
        const fatorCorrecao = (value.pesoBruto || 0) / (value.pesoLiquido || 0.1);
        setValue("fatorCorrecao", toFixed(fatorCorrecao));
      }
    });
  }, [watch]);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const producao = {
      ...data,
      operador_id: params.get("operadorId"),
      operador: params.get("operador"),
      setor: params.get("setor"),
      produto: params.get("produto"),
      produto_nome: params.get("produtoDesc"),
    }
    producao.items = producao.items.filter(i => i.quantidade)
    console.log(producao)
    
    setProducao(producao);
    setVisualizarConfirmacao(true);
  };

  return (
    <>
    {
        !visualizarConfirmacao &&
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
                      {...register(`items.${index}.peso`, { valueAsNumber: true })}
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
      }
      { visualizarConfirmacao && producao &&
        <div>
          <Title>Confirmação</Title>
          <Table>
            <TableBody>

              <TableRow>
                <TableCell>{producao.produto_nome}</TableCell>
                <TableCell></TableCell>
                <TableCell>{producao.pesoBruto}</TableCell>
              </TableRow>

              {
                producao.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>{item.peso}</TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
      }
    </>

  );
}
