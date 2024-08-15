import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";

type Props = {
  params?: {};
  searchParams?: {
    operator?: string;
  };
};

export default async function Setors({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);

  if (!params.get("operator")) {
    return redirect("/");
  }
  const supabase = createClient();
  const { data: sectors } = await supabase.rpc("listar_setores");
  return (
    <AnimationTransitionPage>
      <Title>
        {params.get("operator")} <br /> SELECIONE UM SETOR
      </Title>
      <ContentGrid>
        {sectors?.map((sector: any, index: number) => {
          return (
            <CardButton
              key={index}
              title={sector.nome}
              url={{
                pathname: "/product",
                query: {
                  ...Object.fromEntries(params.entries()),
                  sector: sector.nome,
                },
              }}
            />
          );
        })}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
