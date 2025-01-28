import { createClient } from "@/utils/supabase";
import { FabricantesUpdateClient } from "./page-client";

export default async function FabricantesesUpdate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const product_id = (await params).id;
  const supabase = await createClient();
  const { data: fabricante } = await supabase
    .from("fabricantes")
    .select()
    .eq("id", product_id)
    .maybeSingle();

  return <FabricantesUpdateClient fabricante={fabricante!} />;
}
