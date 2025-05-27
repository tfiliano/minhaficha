"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { toast } from "sonner";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { Inputs, saveProducao } from "@/app/(app)/producao/actions";
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
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const INIT_PRODUCAO = {
  items: [],
  peso_liquido: 0,
  peso_bruto: null,
  peso_perda: 0,
  fator_correcao: 0,
  quantidade: 1,
  produto_nome: "",
  produto_id: null,
  grupo_id: null,
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
  const router = useRouter();

  function getParam(property: string) {
    return searchParams.get(property);
  }

  const [producao, setProducao] = useState<Inputs | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const { register, handleSubmit, watch, setValue } = useForm<Inputs>({
    defaultValues: {
      ...INIT_PRODUCAO,
      items,
      operador_id: getParam("operadorId"),
      operador: getParam("operador"),
      setor: getParam("setor"),
      produto: getParam("produto"),
      produto_id: getParam("produtoId"),
      grupo_id: produto.grupo_id,
      produto_nome: getParam("produtoDesc"),
    },
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
        const fator_correcao = bruto > 0 && liquido > 0 ? bruto / liquido : 0;
        console.log("oi", bruto, liquido, fator_correcao);

        setValue("peso_perda", toFixed(bruto - liquido));
        setValue("fator_correcao", toFixed(fator_correcao));
      }
    });
  }, [watch]);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const producao: Inputs = {
      ...data,
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
    try {
      setLoadingText("Salvando...");
      setLoading(true);
      console.log("ACAO PARA SER DISPARADA PARA O SUPABASE OU API");
      const { produto_nome, operador, ...toSave } = producao || INIT_PRODUCAO;
      console.log(JSON.stringify(toSave, null, 2));

      const response = await saveProducao(toSave!);
      if (response.error) throw response.error;

      router.replace("/");
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
    // if (error) {
    //   setLoadingText(`Erro: ${error.message}`)
    //   console.error(error)
    //   await wait(3e3);
    //   setLoading(false)

    //   return;
    // }
    // setLoading(false);

    //redirect nao funciona :(
    // return redirect("/")
  };

  return (
    <>
      <div
        className={cn(
          "fixed top-0 w-screen h-screen z-50 bg-background/90 text-center flex-1 content-center",
          {
            hidden: !loading,
          }
        )}
      >
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
              <TableCell>
                  <Input
                    type="number"
                    pattern="^[$\-\s]*[\d\,]*?([\.]\d{0,10})?\s*$"
                    {...register("quantidade", { valueAsNumber: true, })}
                  />
                </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder={""}
                  step={0.001}
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
                      <TableCell>{producao!.quantidade}</TableCell>
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
