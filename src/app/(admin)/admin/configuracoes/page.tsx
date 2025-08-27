import { createClient } from "@/utils/supabase";
import { ConfiguracoesPageClient } from "./page-client";
import { cookies } from "next/headers";

export default async function ConfiguracoesPage() {
  const cookieStore = await cookies();
  const lojaId = cookieStore.get('minhaficha_loja_id')?.value;
  
  if (!lojaId) {
    return <div>Loja não selecionada</div>;
  }

  const supabase = await createClient();
  const { data: loja } = await supabase
    .from("lojas")
    .select("*")
    .eq("id", lojaId)
    .single();

  return <ConfiguracoesPageClient loja={loja} />;
}