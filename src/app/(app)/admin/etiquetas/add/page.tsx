import { createClient } from "@/utils/supabase";
import { EtiquetasAddClient } from "./page-client";

export default async function FabricantesesUpdate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: fabricantes } = await supabase.from("fabricantes").select();

  return <EtiquetasAddClient fabricantes={fabricantes!} />;
}
