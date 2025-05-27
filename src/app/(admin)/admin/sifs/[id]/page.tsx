import { createClient } from "@/utils/supabase";
import { SIFUpdateClient } from "./page-client";

export default async function SifsAdd({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sif_id = (await params).id;
  const supabase = await createClient();
  const { data: sif } = await supabase
    .from("sifs")
    .select()
    .eq("id", sif_id)
    .maybeSingle();

  return <SIFUpdateClient sif={sif!} />;
}
