import { AnimationTransitionPage } from "@/components/animation";
import { ContentGrid } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { LojasClient } from "./page-client";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operacao?: string;
  }>;
};

export default async function Fabricantes(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);
  let route = "";

  //Checar se a loja esta selecionada
  //IDEAL USER COOKIE OU LOCALSTORE
  //   if (!params.get("operacao")) {
  //     return redirect("/");
  //   }
  const supabase = createClient();
  const { data: lojas } = await supabase.from("lojas").select("*");

  return (
    <AnimationTransitionPage>
      <ContentGrid>
        <LojasClient lojas={lojas} />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
