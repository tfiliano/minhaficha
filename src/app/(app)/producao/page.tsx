import { Title } from "@/components/layout";
import { ProducaoForm } from "@/components/pages";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import { AnimationTransitionPage } from "../../../components/animation";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operador?: string;
    operacao?: string;
    setor?: string;
    produto?: string;
  }>;
};

export default async function Producao(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);

  if (!params.get("produto")) {
    return redirect("/");
  }
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("produtos")
    .select()
    .eq("originado", params.get("produtoId")!);

  const { data: produto } = await supabase
    .from("produtos")
    .select()
    .eq("id", params.get("produtoId")!)
    .maybeSingle();

  return (
    <AnimationTransitionPage>
      <div className="pb-8">
        <Title>PRODUÇÃO</Title>
        <ProducaoForm produto={produto} items={items || []} />
      </div>
    </AnimationTransitionPage>
  );
}
