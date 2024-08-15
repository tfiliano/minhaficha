import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";

type Props = {
  params?: {};
  searchParams?: {
    operator?: string;
    operation?: string;
    sector?: string;
  };
};

export default async function Products({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);

  if (!params.get("operator")) {
    return redirect("/");
  }
  const supabase = createClient();
  const { data: products } = await supabase
    .from("produtos")
    .select()
    .is("originado", null)
    .eq("setor", params.get("sector")!);
  return (
    <AnimationTransitionPage>
      <Title>SELECIONE UM PRODUTO</Title>
      <ContentGrid>
        {products?.map((product: any, index: number) => {
          return (
            <CardButton
              key={index}
              title={product.nome}
              url={{
                pathname: "/production",
                query: {
                  ...Object.fromEntries(params.entries()),
                  product: product.codigo,
                  productId: product.id,
                },
              }}
            />
          );
        })}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
