import { AnimationTransitionPage } from "@/components/animation";
import { ContentGrid } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { GruposPageClient } from "./page-client";

type Props = {
  params?: {};
  searchParams?: {
    operacao?: string;
  };
};

export default async function Grupos({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);
  let route = "";

  //Checar se a loja esta selecionada
  //IDEAL USER COOKIE OU LOCALSTORE
  //   if (!params.get("operacao")) {
  //     return redirect("/");
  //   }
  const supabase = createClient();
  const { data: grupos } = await supabase.from("grupos").select("*");

  return (
    <AnimationTransitionPage>
      <ContentGrid>
        <GruposPageClient grupos={grupos} />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
