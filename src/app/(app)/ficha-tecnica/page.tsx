import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import { AnimationTransitionPage } from "@/components/animation";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FichaTecnicaList } from "@/components/ficha-tecnica/ficha-tecnica-list";

export default async function FichaTecnicaPage() {
  const supabase = await createClient();

  // Buscar produtos que são itens de cardápio
  const { data: produtosCardapio, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("item_de_cardapio", true)
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("Erro ao buscar produtos:", error);
  }

  // Para cada produto, buscar a ficha técnica, ingredientes e fotos
  const produtosComDados = await Promise.all(
    (produtosCardapio || []).map(async (produto) => {
      // Buscar ficha técnica
      const { data: ficha } = await supabase
        .from("fichas_tecnicas")
        .select("id")
        .eq("produto_cardapio_id", produto.id)
        .maybeSingle();

      let totalIngredientes = 0;
      let fotoCapa = null;

      if (ficha) {
        // Contar ingredientes
        const { count } = await supabase
          .from("fichas_tecnicas_itens")
          .select("*", { count: "exact", head: true })
          .eq("ficha_tecnica_id", ficha.id);

        totalIngredientes = count || 0;

        // Buscar foto de capa
        const { data: foto } = await supabase
          .from("fichas_tecnicas_fotos")
          .select("url")
          .eq("ficha_tecnica_id", ficha.id)
          .eq("is_capa", true)
          .maybeSingle();

        fotoCapa = foto?.url || null;
      }

      return {
        ...produto,
        totalIngredientes,
        fotoCapa,
      };
    })
  );

  return (
    <AnimationTransitionPage>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">

          {/* Alerta se não há produtos de cardápio */}
          {(!produtosCardapio || produtosCardapio.length === 0) && (
            <div className="mb-6">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-6 mb-6">
                    <AlertCircle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Nenhum item de cardápio encontrado
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center mb-6 max-w-md">
                    Para criar fichas técnicas, primeiro você precisa cadastrar produtos e marcá-los como &quot;Item de Cardápio&quot;
                    no formulário de produtos.
                  </p>
                  <Button asChild>
                    <Link href="/admin/produtos/add">
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Produto
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de Fichas Técnicas com Filtros */}
          {produtosComDados && produtosComDados.length > 0 && (
            <FichaTecnicaList produtos={produtosComDados} />
          )}
        </div>
      </div>
    </AnimationTransitionPage>
  );
}
