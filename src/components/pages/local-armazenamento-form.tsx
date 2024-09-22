"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { toast } from "sonner";

import { ILocalArmazenamento, saveLocalArmazenamento } from "@/app/admin/adm-armazenamento/add/actions";

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


export function LocalArmazenamentoForm() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const router = useRouter();

  const [localArmazenamento, setLocalArmazenamento] = useState<ILocalArmazenamento | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<ILocalArmazenamento>({
    defaultValues: {
      armazenamento: "",
    },
  });

  const onSubmit: SubmitHandler<ILocalArmazenamento> = async (formValue) => {
    try {
      setLoading(true);
      const response = await saveLocalArmazenamento({ ...formValue });

      if (response.error) throw response.error;

      router.replace("/admin/adm-armazenamento");
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
              <TableCell className="font-medium">Nome</TableCell>
              <TableCell>
                <Input
                  placeholder={""}
                  {...register("armazenamento")}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Button className="m-8" type="submit">
          Salvar
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
