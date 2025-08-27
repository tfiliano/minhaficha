import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { LojaUpdateClient } from "./page-client";

export default async function LojaUpdate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const loja_id = (await params).id;
  
  // Usar cliente admin para ver todos os dados
  const supabase = await createSupabaseServerAdmin();
  const { data: loja } = await supabase
    .from("lojas")
    .select("*,usuarios:loja_usuarios(tipo,data:usuarios(*))")
    .eq("id", loja_id)
    .maybeSingle();

  console.log("Master - Loja encontrada:", loja?.nome, "Usuários:", loja?.usuarios?.length || 0);

  return <LojaUpdateClient loja={loja!} />;
}
