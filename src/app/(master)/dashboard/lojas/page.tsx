import { AnimationTransitionPage } from "@/components/animation";
import { ContentGrid } from "@/components/layout";
import { createClient } from "@/utils/supabase";
import { LojasPageClient } from "./page-client";

export default async function Lojas() {
  const supabase = await createClient();
  const { data: lojas, error } = await supabase.from("lojas").select("*");
  return (
    <AnimationTransitionPage>
      <ContentGrid>
        <LojasPageClient lojas={lojas} />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
