import { AnimationTransitionPage } from "@/components/animation";
import { createClient } from "@/utils/supabase";
import { EtiquetasPageClient } from "./page-client";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operacao?: string;
  }>;
};

export default async function Produtos(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);
  let route = "";

  //Checar se a loja esta selecionada
  //IDEAL USER COOKIE OU LOCALSTORE
  //   if (!params.get("operacao")) {
  //     return redirect("/");
  //   }
  const supabase = await createClient();
  const { data: etiquetas, error } = await supabase
    .from("etiquetas")
    .select("*")
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar etiquetas:', error);
  }

  console.log('Etiquetas encontradas:', etiquetas?.length || 0);

  return (
    <AnimationTransitionPage>
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <EtiquetasPageClient etiquetas={etiquetas} />
      </div>
    </AnimationTransitionPage>
  );
}
