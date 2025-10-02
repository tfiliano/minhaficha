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
import { cookies } from "next/headers";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FichaTecnicaEditPage(props: Props) {
  const params = await props.params;
  const produtoId = params.id;

  const supabase = await createClient();

  // Obter loja_id do cookie
  const cookieStore = await cookies();
  const lojaId = cookieStore.get("minhaficha_loja_id")?.value || "";

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

  // Buscar fotos da ficha técnica
  const { data: fotos } = await supabase
    .from("fichas_tecnicas_fotos")
    .select("*")
    .eq("ficha_tecnica_id", fichaTecnica?.id || "")
    .order("ordem", { ascending: true });

  return (
    <AnimationTransitionPage>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-5xl">

          {/* Formulário */}
          {fichaTecnica ? (
            <FichaTecnicaForm
              fichaTecnicaId={fichaTecnica.id}
              lojaId={lojaId}
              produtoCardapio={{
                id: produto.id,
                codigo: produto.codigo,
                nome: produto.nome,
                unidade: produto.unidade,
              }}
              ingredientes={ingredientes || []}
              fotos={fotos || []}
              porcoes={fichaTecnica.porcoes || undefined}
              observacoes={fichaTecnica.observacoes || undefined}
              modoPreparo={fichaTecnica.modo_preparo || undefined}
              tempoPreparoMinutos={fichaTecnica.tempo_preparo_minutos || undefined}
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
