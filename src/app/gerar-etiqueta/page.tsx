import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import { AnimationTransitionPage } from "../../components/animation";

import { Title } from "@/components/layout";
import { GerarEtiquetaForm } from "@/components/pages";

type Props = {
  params?: {};
  searchParams?: {
    operador?: string;
    operacao?: string;
    setor?: string;
    produto?: string;
  };
};

export default async function GerarEtiqueta({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);

  if (!params.get("produto")) {
    return redirect("/");
  }
  const supabase = createClient();
  // const { data: items } = await supabase
  //   .from("produtos")
  //   .select()
  //   .eq("originado", params.get("produto"));

  const { data: produto } = await supabase
    .from("produtos")
    .select()
    .eq("id", params.get("produtoId")!)
    .maybeSingle();

  return (
    <AnimationTransitionPage>
      <div className="pb-8">
        <Title>Gerar Etiqueta</Title>
        <GerarEtiquetaForm produto={produto} />
      </div>
    </AnimationTransitionPage>
  );
}
