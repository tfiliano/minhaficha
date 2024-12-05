import { createClient } from "@/utils/supabase";
import { GruposUpdateClient } from "./page-client";

export default async function GruposesUpdate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const product_id = (await params).id;
  const supabase = createClient();
  const { data: grupo } = await supabase
    .from("grupos")
    .select()
    .eq("id", product_id)
    .maybeSingle();

  return <GruposUpdateClient grupo={grupo!} />;
}
