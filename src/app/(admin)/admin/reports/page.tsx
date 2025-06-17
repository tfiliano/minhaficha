import { createClient } from "@/utils/supabase";
import ReportsPageClient from "./page-client";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: produtos } = await supabase
    .from("produtos")
    .select()
    .is("originado", null);

  return <ReportsPageClient produtos={produtos || []} />;
}
