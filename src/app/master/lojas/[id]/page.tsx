import { createClient } from "@/utils/supabase";
import { LojasUpdateClient } from "./page-client";

export default async function LojasesUpdate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const product_id = (await params).id;
  const supabase = createClient();
  const { data: loja } = await supabase
    .from("lojas")
    .select("*,loja_usuarios(usuario:usuarios(*))")
    .eq("id", product_id)
    .maybeSingle();

  return <LojasUpdateClient loja={loja!} />;
}
