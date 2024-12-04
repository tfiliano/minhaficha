import { AnimationTransitionPage } from "@/components/animation";
import { ContentGrid } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { FabricantesClient } from "./page-client";

type Props = {
  params?: {};
  searchParams?: {
    operacao?: string;
  };
};

export default async function Fabricantes({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);
  let route = "";

  //Checar se a loja esta selecionada
  //IDEAL USER COOKIE OU LOCALSTORE
  //   if (!params.get("operacao")) {
  //     return redirect("/");
  //   }
  const supabase = createClient();
  const { data: fabricantes } = await supabase.from("fabricantes").select("*");

  return (
    <AnimationTransitionPage>
      <ContentGrid>
        <FabricantesClient fabricantes={fabricantes} />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
