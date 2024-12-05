import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operacao?: string;
  }>;
};

export default async function Operadores(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);
  let route = ""

  if (!params.get("operacao")) {
    return redirect("/");
  }

  if (params.get("operacao") == "Produção") route = "/setor"
  else if (params.get("operacao") == "Etiquetas") route = "/setor"
  else if (params.get("operacao") == "Entrada de Insumos") route = "/selecionar-insumo";

  const supabase = createClient();
  const { data: operadores } = await supabase.from("operadores").select("*");

  return (
    <AnimationTransitionPage>
      <Title>
        {params.get("operacao")} <br /> SELECIONE UM OPERADOR
      </Title>
      <ContentGrid>
        {operadores?.map((operador) => {
          return (
            <div key={operador.id}>
              <CardButton
                title={operador.nome}
                url={{
                  pathname: route,
                  query: {
                    ...Object.fromEntries(params.entries()),
                    operador: operador.nome,
                    operadorId: operador.id,
                  },
                }}
              />
            </div>
          );
        })}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
