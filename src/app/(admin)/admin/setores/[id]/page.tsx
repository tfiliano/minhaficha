import { createClient } from "@/utils/supabase";
import { SetoresUpdateClient } from "./page-client";

export default async function SetoresUpdate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const product_id = (await params).id;
  const supabase = await createClient();
  const { data: setor } = await supabase
    .from("setores")
    .select()
    .eq("id", product_id)
    .maybeSingle();

  return <SetoresUpdateClient setor={setor!} />;
}
