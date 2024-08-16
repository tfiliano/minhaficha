import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";

type Props = {
  params?: {};
  searchParams?: {
    operacao?: string;
  };
};

export default async function Operadores({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);

  if (!params.get("operacao")) {
    return redirect("/");
  }
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
                  pathname: "/setor",
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
