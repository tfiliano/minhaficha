import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";

type Props = {
  params?: {};
  searchParams?: {
    operador?: string;
  };
};

export default async function Setores({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);

  if (!params.get("operador")) {
    return redirect("/");
  }
  const supabase = createClient();
  const { data: setors } = await supabase.rpc("listar_setores");
  return (
    <AnimationTransitionPage>
      <Title>
        {params.get("operador")} <br /> SELECIONE UM SETOR
      </Title>
      <ContentGrid>
        {setors?.map((setor: any, index: number) => {
          return (
            <CardButton
              key={index}
              title={setor.nome}
              url={{
                pathname: "/produto",
                query: {
                  ...Object.fromEntries(params.entries()),
                  setor: setor.nome,
                },
              }}
            />
          );
        })}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
