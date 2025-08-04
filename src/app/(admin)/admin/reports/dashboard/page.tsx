import { createClient } from "@/utils/supabase";
import { ProductionDashboard } from "./page.view";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: produtos } = await supabase
    .from("produtos")
    .select()
    .is("originado", null);

  return <ProductionDashboard produtos={produtos!} />;
}
