import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { LocalArmazenamentoForm } from "@/components/pages/local-armazenamento-form";
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
  params: { id: string };
  searchParams?: {
    operacao?: string;
  };
};

export default async function LocalArmazenamento({ params, searchParams }: Props) {
  const query = new URLSearchParams(searchParams);

  const supabase = createClient();
  const { data: armazenamento } = await supabase.from("locais_armazenamento").select("*").eq("id", params.id).maybeSingle();

  return (
    <AnimationTransitionPage>
      <div className="mb-4">
        <Title>
          {query.get("operacao")} <br /> Editar Armazenamento [{armazenamento.armazenamento}]
        </Title>
      </div>

      <div className="bg-white shadow-md rounded-md p-4">
        <LocalArmazenamentoForm data={armazenamento} />
      </div>
    </AnimationTransitionPage>
  );
}
