import { AnimationTransitionPage } from "@/components/animation";
import { ContentGrid } from "@/components/layout";
import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { UsuariosPageClient } from "./page-client";

export default async function UsuariosPage() {
  // Usar cliente admin para ver TODOS os usuários e lojas
  const supabase = await createSupabaseServerAdmin();
  
  // Buscar todos os usuários com suas associações de lojas
  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select(`
      *,
      loja_usuarios (
        loja_id,
        tipo,
        ativo,
        loja:lojas(nome, codigo)
      )
    `)
    .order("created_at", { ascending: false });

  // Buscar todas as lojas disponíveis para seleção
  const { data: lojas, error: lojasError } = await supabase
    .from("lojas")
    .select("id, nome, codigo")
    .order("nome", { ascending: true });
  
  console.log("Master - Usuários encontrados:", usuarios?.length || 0);
  console.log("Master - Lojas encontradas:", lojas?.length || 0);
  
  if (error) {
    console.error("Erro ao buscar usuários:", error);
  }
  if (lojasError) {
    console.error("Erro ao buscar lojas:", lojasError);
  }
  
  return (
    <AnimationTransitionPage>
      <ContentGrid>
        <UsuariosPageClient usuarios={usuarios || []} lojas={lojas || []} />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}