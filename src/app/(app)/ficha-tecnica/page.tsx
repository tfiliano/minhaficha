import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import { AnimationTransitionPage } from "@/components/animation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Package, AlertCircle, Plus, Image as ImageIcon, ListChecks } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <ChefHat className="h-8 w-8" />
                    Fichas Técnicas
                  </h1>
                  <p className="text-orange-100">
                    Gerencie os ingredientes e composição dos itens do cardápio
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-8 w-8 text-orange-200" />
                    <div className="text-right">
                      <p className="text-xs text-orange-200">Itens</p>
                      <p className="text-lg font-bold">{produtosComDados?.length || 0}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Gestão de Receitas
                  </Badge>
                </div>
              </div>
              <div>
                <Button variant="secondary" asChild>
                  <Link href="/admin/produtos/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item de Cardápio
                  </Link>
                </Button>
              </div>
            </div>
          </div>

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

          {/* Grid de Produtos de Cardápio */}
          {produtosComDados && produtosComDados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtosComDados.map((produto) => (
                <Link
                  key={produto.id}
                  href={`/ficha-tecnica/${produto.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-2 hover:border-orange-300 dark:hover:border-orange-700 overflow-hidden">
                    {/* Foto de Capa (se existir) */}
                    {produto.fotoCapa && (
                      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
                        <img
                          src={produto.fotoCapa}
                          alt={produto.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <ChefHat className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            <Badge variant="outline" className="text-xs">
                              {produto.codigo}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                            {produto.nome}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span>{produto.grupo}</span>
                            <span className="text-slate-400">•</span>
                            <span>{produto.setor}</span>
                          </div>
                        </div>
                      </div>

                      {/* Badges de Status */}
                      <div className="flex items-center gap-2 mb-4">
                        {produto.totalIngredientes > 0 ? (
                          <Badge variant="default" className="bg-green-600">
                            <ListChecks className="h-3 w-3 mr-1" />
                            {produto.totalIngredientes} {produto.totalIngredientes === 1 ? 'ingrediente' : 'ingredientes'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            Sem ingredientes
                          </Badge>
                        )}
                        {produto.fotoCapa && (
                          <Badge variant="secondary">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Com foto
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Unidade: {produto.unidade}
                        </span>
                        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                          Gerenciar →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimationTransitionPage>
  );
}
