import { createClient } from "@/utils/supabase";
import { ImpressoraUpdateClient } from "./page-client";

export default async function ImpressorasAdd({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const printer_id = (await params).id;
  const supabase = createClient();
  const { data: impressora } = await supabase
    .from("impressoras")
    .select()
    .eq("id", printer_id)
    .maybeSingle();

  return <ImpressoraUpdateClient impressora={impressora!} />;
}
