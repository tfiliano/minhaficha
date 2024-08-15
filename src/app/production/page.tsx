import { Title } from "@/components/layout";
import { ProductionForm } from "@/components/pages";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import { AnimationTransitionPage } from "../../components/animation";

type Props = {
  params?: {};
  searchParams?: {
    operator?: string;
    operation?: string;
    sector?: string;
    product?: string;
  };
};

export default async function Production({ searchParams }: Props) {
  const params = new URLSearchParams(searchParams);

  if (!params.get("product")) {
    return redirect("/");
  }
  const supabase = createClient();
  const { data: items } = await supabase
    .from("produtos")
    .select()
    .eq("originado", params.get("product"));

  const { data: product } = await supabase
    .from("produtos")
    .select()
    .eq("id", params.get("productId"))
    .maybeSingle();

  return (
    <AnimationTransitionPage>
      <div className="pb-8">
        <Title>PRODUÇÃO</Title>
        <ProductionForm product={product} items={items || []} />
      </div>
    </AnimationTransitionPage>
  );
}
