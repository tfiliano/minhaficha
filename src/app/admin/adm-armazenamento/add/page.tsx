import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import { AnimationTransitionPage } from "../../../../components/animation";
import { LocalArmazenamentoForm } from "@/components/pages/local-armazenamento-form";
import { Title } from "@/components/layout";

type Props = {
  params?: {};
  searchParams?: {
    operador?: string;
    operacao?: string;
    setor?: string;
    produto?: string;
  };
};

export default async function LocalArmazenamento({ searchParams }: Props) {
  // const params = new URLSearchParams(searchParams);

  // if (!params.get("produto")) {
  //   return redirect("/");
  // }
  // const supabase = createClient();
  
  // const { data: produto } = await supabase
  //   .from("produtos")
  //   .select()
  //   .eq("id", params.get("produtoId"))
  //   .maybeSingle();

  return (
    <AnimationTransitionPage>
      <div className="pb-8">
        {/* <Title>RECEBIMENTO</Title> */}
        <LocalArmazenamentoForm />
      </div>
    </AnimationTransitionPage>
  );
}
