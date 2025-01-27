import { AnimationTransitionPage } from "@/components/animation";
import { ContentGrid } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { LocaisArmazenamentoClient } from "./page-client";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operacao?: string;
  }>;
};

export default async function LocalArmazenamento(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);
  let route = "";

  //Checar se a loja esta selecionada
  //IDEAL USER COOKIE OU LOCALSTORE
  //   if (!params.get("operacao")) {
  //     return redirect("/");
  //   }
  const supabase = createClient();
  const { data: locais_armazenamento } = await supabase
    .from("locais_armazenamento")
    .select("*");

  return (
    <AnimationTransitionPage>
      <ContentGrid>
        <LocaisArmazenamentoClient
          locais_armazenamento={locais_armazenamento}
        />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
