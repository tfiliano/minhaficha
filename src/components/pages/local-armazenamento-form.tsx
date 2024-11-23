"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { ILocalArmazenamento, saveLocalArmazenamento, updateLocalArmazenamento } from "@/app/admin/adm-armazenamento/add/actions";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useRouter } from "@/hooks/use-router";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

type Props = {
  data?: { 
    id: string,
    armazanamento: string;
    created_at: string;
  };
};

const LoadingOverlay = ({ loading, loadingText }: { loading: boolean, loadingText: string }) => (
  loading ? (
    <div className="fixed top-0 w-screen h-screen z-50 bg-background/90 text-center flex flex-col items-center justify-center">
      <LoaderCircle className="animate-spin" />
      {loadingText || "Processando..."}
    </div>
  ) : null
);

export function LocalArmazenamentoForm({ data }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const router = useRouter();
  const { register, handleSubmit } = useForm<ILocalArmazenamento>({
    defaultValues: {
      armazenamento: data?.armazanamento || "",
    },
  });

  const onSubmit: SubmitHandler<ILocalArmazenamento> = async (formValue) => {
    setLoading(true);
    try {
      const response = data?.id 
        ? await updateLocalArmazenamento({ ...data, ...formValue }) 
        : await saveLocalArmazenamento(formValue);

      if (response?.error) throw response.error;

      router.replace("/admin/adm-armazenamento");
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay loading={loading} loadingText={loadingText} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-w-3xl w-full mx-auto p-4 bg-white shadow-md rounded-md">
        <Table className="mb-4">
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Nome</TableCell>
              <TableCell>
                <Input placeholder="Digite o nome do armazenamento" {...register("armazenamento")} className="w-full" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Button className="self-end" type="submit">Salvar</Button>
      </form>
    </>
  );
}
