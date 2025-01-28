import { createClient } from "@/utils/supabase";
import { LocalArmazenamentoUpdateClient } from "./page-client";

export default async function FabricantesesUpdate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const product_id = (await params).id;
  const supabase = await createClient();
  const { data: localArmazenamento } = await supabase
    .from("locais_armazenamento")
    .select()
    .eq("id", product_id)
    .maybeSingle();

  return (
    <LocalArmazenamentoUpdateClient localArmazenamento={localArmazenamento!} />
  );
}
