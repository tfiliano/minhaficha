import { createClient } from "@/utils/supabase";
import { ProdutoAddClient } from "./page-client";

export default async function ProdutosAdd() {
  const supabase = createClient();
  const { data: produtos } = await supabase.from("produtos").select("*");
  const { data: grupos } = await supabase.from("grupos").select("*");
  const { data: armazenamentos } = await supabase
    .from("locais_armazenamento")
    .select("*");

  return (
    <ProdutoAddClient
      produtos={produtos!}
      grupos={grupos!}
      armazenamentos={armazenamentos!}
    />
  );
}
