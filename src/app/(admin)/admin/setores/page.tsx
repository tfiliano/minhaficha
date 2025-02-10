import { AnimationTransitionPage } from "@/components/animation";
import { ContentGrid } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { SetoresPageClient } from "./page-client";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operacao?: string;
  }>;
};

export default async function Setores(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);
  let route = "";

  //Checar se a loja esta selecionada
  //IDEAL USER COOKIE OU LOCALSTORE
  //   if (!params.get("operacao")) {
  //     return redirect("/");
  //   }
  const supabase = await createClient();
  const { data: setores } = await supabase.from("setores").select("*");

  return (
    <AnimationTransitionPage>
      <ContentGrid>
        <SetoresPageClient setores={setores} />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
