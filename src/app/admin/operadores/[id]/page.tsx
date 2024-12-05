import { createClient } from "@/utils/supabase";
import { OperadoresUpdateClient } from "./page-client";

export default async function OperadoresUpdate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const product_id = (await params).id;
  const supabase = createClient();
  const { data: operador } = await supabase
    .from("operadores")
    .select()
    .eq("id", product_id)
    .maybeSingle();

  return <OperadoresUpdateClient operador={operador!} />;
}
