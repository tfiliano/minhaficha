import { createClient } from "@/utils/supabase";
import { ProdutoUpdateClient } from "./page-client";

export default async function ProdutosAdd({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const product_id = (await params).id;
  const supabase = await createClient();
  const { data: produto } = await supabase
    .from("produtos")
    .select()
    .eq("id", product_id)
    .maybeSingle();
  const { data: produtos } = await supabase.from("produtos").select("*");
  const { data: grupos } = await supabase.from("grupos").select("*");
  const { data: armazenamentos } = await supabase
    .from("locais_armazenamento")
    .select("*");

  const { data: setores } = await supabase.from("setores").select("id,nome");

  return (
    <ProdutoUpdateClient
      produtos={produtos!}
      grupos={grupos!}
      armazenamentos={armazenamentos!}
      produto={produto!}
      setores={setores}
    />
  );
}
