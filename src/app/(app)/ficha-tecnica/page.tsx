import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import { AnimationTransitionPage } from "@/components/animation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Package, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  return (
    <AnimationTransitionPage>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
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
                      <p className="text-lg font-bold">{produtosCardapio?.length || 0}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Gestão de Receitas
                  </Badge>
                </div>
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
          {produtosCardapio && produtosCardapio.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtosCardapio.map((produto) => (
                <Link
                  key={produto.id}
                  href={`/ficha-tecnica/${produto.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-2 hover:border-orange-300 dark:hover:border-orange-700">
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
