import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operador?: string;
    operacao?: string;
    setor?: string;
  }>;
};

export default async function Produtos(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);
  let route = "";

  if (!params.get("operador")) {
    return redirect("/");
  }
  const supabase = await createClient();
  let produtos: any[] | null;

  if (params.get("operacao") == "Etiquetas") {
    route = "/gerar-etiqueta";

    const { data } = await supabase.from("produtos").select();

    produtos = data;
  } else {
    route = "/entrada-insumo";
    const { data } = await supabase
      .from("produtos")
      .select()
      .is("originado", null);

    produtos = data;
  }

  return (
    <AnimationTransitionPage>
      <Title>SELECIONE UM PRODUTO</Title>
      <ContentGrid>
        {produtos?.map((produto: any, index: number) => {
          return (
            <CardButton
              key={index}
              title={produto.nome}
              url={{
                pathname: route,
                query: {
                  ...Object.fromEntries(params.entries()),
                  produto: produto.codigo,
                  produtoId: produto.id,
                  produtoDesc: produto.nome,
                },
              }}
            />
          );
        })}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
