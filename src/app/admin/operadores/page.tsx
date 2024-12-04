import { AnimationTransitionPage } from "@/components/animation";
import { ContentGrid } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { OperadoresClient } from "./page-client";

type Props = {
  params?: {};
  searchParams?: {
    operacao?: string;
  };
};

export default async function Operadores({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);
  let route = "";

  //Checar se a loja esta selecionada
  //IDEAL USER COOKIE OU LOCALSTORE
  //   if (!params.get("operacao")) {
  //     return redirect("/");
  //   }
  const supabase = createClient();
  const { data: operadores } = await supabase.from("operadores").select("*");

  return (
    <AnimationTransitionPage>
      <ContentGrid>
        <OperadoresClient operadores={operadores} />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
