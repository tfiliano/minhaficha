import { createClient } from "@/utils/supabase";
import { EtiquetasUpdateClient } from "./page-client";

export default async function FabricantesesUpdate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const product_id = (await params).id;
  const supabase = createClient();
  const { data: etiqueta } = await supabase
    .from("etiquetas")
    .select()
    .eq("id", product_id)
    .maybeSingle();

  const { data: fabricantes } = await supabase.from("fabricantes").select();

  return (
    <EtiquetasUpdateClient etiqueta={etiqueta!} fabricantes={fabricantes!} />
  );
}
