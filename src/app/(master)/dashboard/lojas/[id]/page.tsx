import { createClient } from "@/utils/supabase";
import { LojaUpdateClient } from "./page-client";

export default async function LojaUpdate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const loja_id = (await params).id;
  const supabase = await createClient();
  const { data: loja } = await supabase
    .from("lojas")
    .select("*,usuarios:loja_usuarios(data:usuarios(*))")
    .eq("id", loja_id)
    .maybeSingle();

  return <LojaUpdateClient loja={loja!} />;
}
