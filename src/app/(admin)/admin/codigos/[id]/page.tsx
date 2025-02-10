import { createClient } from "@/utils/supabase";
import { CodigosUpdateClient } from "./page-client";

export default async function CodigosAdd({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const codigo_id = (await params).id;
  const supabase = await createClient();
  const { data: codigo } = await supabase
    .from("codigos")
    .select()
    .eq("id", codigo_id)
    .maybeSingle();

  return <CodigosUpdateClient codigo={codigo!} />;
}
