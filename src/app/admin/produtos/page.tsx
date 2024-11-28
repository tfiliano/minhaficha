import { AnimationTransitionPage } from "@/components/animation";
import { ContentGrid } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { ProdutosPageClient } from "./page-client";

type Props = {
  params?: {};
  searchParams?: {
    operacao?: string;
  };
};

export default async function Produtos({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);
  let route = "";

  //Checar se a loja esta selecionada
  //IDEAL USER COOKIE OU LOCALSTORE
  //   if (!params.get("operacao")) {
  //     return redirect("/");
  //   }
  const supabase = createClient();
  const { data: produtos } = await supabase.from("produtos").select("*");

  return (
    <AnimationTransitionPage>
      <ContentGrid>
        <ProdutosPageClient produtos={produtos} />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
