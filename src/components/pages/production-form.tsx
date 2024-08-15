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
import { useEffect } from "react";

type Inputs = {
  items: any[];
  pesoBruto: number;
  pesoLiquido: number;
  pesoPerda: number;
};

export function ProductionForm({
  items,
  product,
}: {
  items: any[];
  product: any;
}) {
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
    },
  });

  useEffect(() => {
    watch((value, { name, type }) => {
      if (type === "change" && name?.includes("items.")) {
        setValue(
          "pesoLiquido",
          value.items!.reduce((acc, item) => (acc += item.peso || 0), 0)
        );
        setValue("pesoPerda", value.pesoBruto! - value.pesoLiquido!);
      }
    });
  }, [watch]);

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col max-w-3xl w-full mx-auto"
    >
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">{product.nome}</TableCell>
            <TableCell>{product.unidade}</TableCell>
            <TableCell>
              <Input
                type="number"
                placeholder={product.unidade}
                {...register("pesoBruto", { valueAsNumber: true })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">LÍQUIDO</TableCell>
            <TableCell>{product.unidade}</TableCell>
            <TableCell>
              <Input
                type="number"
                placeholder="KG"
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
            <TableHead>KILO</TableHead>
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

      <Button className="m-8" type="submit">
        Enviar
      </Button>
    </form>
  );
}
