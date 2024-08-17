import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";

type Props = {
  params?: {};
  searchParams?: {
    operador?: string;
    operacao?: string;
    setor?: string;
  };
};

export default async function Produtos({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);

  if (!params.get("operador")) {
    return redirect("/");
  }
  const supabase = createClient();
  const { data: produtos } = await supabase
    .from("produtos")
    .select()
    .is("originado", null)
    .eq("setor", params.get("setor")!);
  return (
    <AnimationTransitionPage>
      <Title>SELECIONE UM PRODUTO</Title>
      <ContentGrid>
        {produtos?.map((produto: any, index: number) => {
          return (
            <CardButton
              key={index}
              title={produto.nome}
              url={{
                pathname: "/producao",
                query: {
                  ...Object.fromEntries(params.entries()),
                  produto: produto.codigo,
                  produtoId: produto.id,
                  produtoDesc: produto.nome,
                },
              }}
            />
          );
        })}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
