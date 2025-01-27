import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operacao?: string;
  }>;
};

export default async function Produtos(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);
  let route = ""

  //Checar se a loja esta selecionada
  //   if (!params.get("operacao")) {
  //     return redirect("/");
  //   }
  const supabase = createClient();
  const { data: produtos } = await supabase.from("produtos").select("*");

  return (
    <AnimationTransitionPage>
      <Title>
        {params.get("operacao")} <br /> SELECIONE UM OPERADOR
      </Title>
      <ContentGrid>
        {produtos?.map((produto) => {
          return (
            <div key={produto.id}>
              {produto.nome}
            </div>
          );
        })}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
