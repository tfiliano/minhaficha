import { AnimationTransitionPage } from "@/components/animation";
import { ContentGrid } from "@/components/layout";
import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { LojasPageClient } from "./page-client";

export default async function Lojas() {
  // Usar cliente admin para ver TODAS as lojas
  const supabase = await createSupabaseServerAdmin();
  const { data: lojas, error } = await supabase.from("lojas").select("*");
  
  console.log("Master - Lojas encontradas:", lojas?.length || 0);
  if (error) {
    console.error("Erro ao buscar lojas:", error);
  }
  
  return (
    <AnimationTransitionPage>
      <ContentGrid>
        <LojasPageClient lojas={lojas} />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
