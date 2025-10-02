import { createClient } from "@/utils/supabase";
import { redirect, notFound } from "next/navigation";
import { AnimationTransitionPage } from "@/components/animation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Package, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FichaTecnicaForm } from "@/components/ficha-tecnica/ficha-tecnica-form";
import { upsertFichaTecnica } from "../actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FichaTecnicaEditPage(props: Props) {
  const params = await props.params;
  const produtoId = params.id;

  const supabase = await createClient();

  // Buscar o produto de cardápio
  const { data: produto, error: produtoError } = await supabase
    .from("produtos")
    .select("*")
    .eq("id", produtoId)
    .eq("item_de_cardapio", true)
    .maybeSingle();

  if (produtoError || !produto) {
    notFound();
  }

  // Buscar ou criar a ficha técnica
  let { data: fichaTecnica } = await supabase
    .from("fichas_tecnicas")
    .select("*")
    .eq("produto_cardapio_id", produtoId)
    .maybeSingle();

  // Se não existe ficha técnica, criar uma
  if (!fichaTecnica) {
    const result = await upsertFichaTecnica({
      produto_cardapio_id: produtoId,
      nome: produto.nome,
      ativo: true,
    });

    if (result.success && result.data) {
      fichaTecnica = result.data;
    }
  }

  // Buscar ingredientes da ficha técnica
  const { data: ingredientes } = await supabase
    .from("fichas_tecnicas_itens")
    .select(`
      *,
      produto:produto_ingrediente_id (
        id,
        codigo,
        nome,
        unidade,
        grupo
      )
    `)
    .eq("ficha_tecnica_id", fichaTecnica?.id || "")
    .order("ordem", { ascending: true });

  return (
    <AnimationTransitionPage>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  asChild
                  className="text-white hover:bg-white/20"
                >
                  <Link href="/ficha-tecnica">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Link>
                </Button>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <ChefHat className="h-8 w-8" />
                  Ficha Técnica
                </h1>
                <p className="text-orange-100">
                  Configure os ingredientes e quantidades para {produto.nome}
                </p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          {fichaTecnica ? (
            <FichaTecnicaForm
              fichaTecnicaId={fichaTecnica.id}
              produtoCardapio={{
                id: produto.id,
                codigo: produto.codigo,
                nome: produto.nome,
                unidade: produto.unidade,
              }}
              ingredientes={ingredientes || []}
              porcoes={fichaTecnica.porcoes || undefined}
              observacoes={fichaTecnica.observacoes || undefined}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6 mb-6">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Erro ao carregar ficha técnica
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Não foi possível criar ou carregar a ficha técnica para este produto
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AnimationTransitionPage>
  );
}
