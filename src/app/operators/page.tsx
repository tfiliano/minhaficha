import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";

type Props = {
  params?: {};
  searchParams?: {
    operation?: string;
  };
};

export default async function Operators({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);

  if (!params.get("operation")) {
    return redirect("/");
  }
  const supabase = createClient();
  const { data: operators } = await supabase.from("operadores").select("*");

  return (
    <AnimationTransitionPage>
      <Title>
        {params.get("operation")} <br /> SELECIONE UM OPERADOR
      </Title>
      <ContentGrid>
        {operators?.map((operator) => {
          return (
            <div key={operator.id}>
              <CardButton
                title={operator.nome}
                url={{
                  pathname: "/sector",
                  query: {
                    ...Object.fromEntries(params.entries()),
                    operator: operator.nome,
                    operatorId: operator.id,
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
