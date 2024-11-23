import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { createClient } from "@/utils/supabase";

import { redirect } from "next/navigation";
import { Input } from "postcss";

type Props = {
  params?: {};
  searchParams?: {
    operacao?: string;
  };
};

export default async function LocalArmazenamento({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);
  let route = ""

  //Checar se a loja esta selecionada
//   if (!params.get("operacao")) {
//     return redirect("/");
//   }
  const supabase = createClient();
  const { data: armazenamentoList } = await supabase.from("locais_armazenamento").select("*");

  return (
    <AnimationTransitionPage>
      <div className="mb-4">
        <Title>
          {params.get("operacao")} <br /> Locais de Armazenamento 
        </Title>
        <CardButton
          title="+ add"
          url="/admin/adm-armazenamento/add"
        />
      </div>

      <Table className="bg-white shadow-md rounded-md">
        <TableBody>
          {armazenamentoList?.map((item) => {
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.armazenamento}</TableCell>
                <TableCell>{item.armazenamento}</TableCell>
              </TableRow>
            );
          })}            
        </TableBody>
      </Table>
    </AnimationTransitionPage>
  );
}
