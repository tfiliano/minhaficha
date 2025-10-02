import { AnimationTransitionPage } from "@/components/animation";
import { createClient } from "@/utils/supabase";
import { cookies } from "next/headers";
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
  const supabase = await createClient();
  const co = await cookies();
  console.log(co.get("minhaficha_loja_id")?.value);
  const { data: locais_armazenamento } = await supabase
    .from("locais_armazenamento")
    .select("*");

  return (
    <AnimationTransitionPage>
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <LocaisArmazenamentoClient
          locais_armazenamento={locais_armazenamento}
        />
      </div>
    </AnimationTransitionPage>
  );
}
