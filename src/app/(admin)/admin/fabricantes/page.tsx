import { AnimationTransitionPage } from "@/components/animation";
import { createClient } from "@/utils/supabase";
import { FabricantesClient } from "./page-client";

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
  const supabase = await createClient();
  const { data: fabricantes } = await supabase.from("fabricantes").select("*");

  return (
    <AnimationTransitionPage>
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <FabricantesClient fabricantes={fabricantes} />
      </div>
    </AnimationTransitionPage>
  );
}
