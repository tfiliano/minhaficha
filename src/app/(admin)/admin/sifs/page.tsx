import { AnimationTransitionPage } from "@/components/animation";
import { createClient } from "@/utils/supabase";
import { SifsPageClient } from "./page-client";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operacao?: string;
  }>;
};

export default async function Sifs(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);
  let route = "";

  //Checar se a loja esta selecionada
  //IDEAL USER COOKIE OU LOCALSTORE
  //   if (!params.get("operacao")) {
  //     return redirect("/");
  //   }
  const supabase = await createClient();
  const { data: sifs } = await supabase.from("sifs").select("*");

  return (
    <AnimationTransitionPage>
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <SifsPageClient sifs={sifs} />
      </div>
    </AnimationTransitionPage>
  );
}
