import { ProducaoForm } from "@/components/pages";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import { AnimationTransitionPage } from "../../../components/animation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Package, AlertCircle } from "lucide-react";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operador?: string;
    operacao?: string;
    setor?: string;
    produto?: string;
  }>;
};

export default async function ProducaoPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);

  if (!params.get("produto")) {
    return redirect("/");
  }
  
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("produtos")
    .select()
    .eq("originado", params.get("produtoId")!);

  const { data: produto } = await supabase
    .from("produtos")
    .select()
    .eq("id", params.get("produtoId")!)
    .maybeSingle();

  if (!produto) {
    return (
      <AnimationTransitionPage>
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6 mb-6">
                <Package className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Produto não encontrado
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center">
                O produto selecionado não foi encontrado ou não existe mais no sistema
              </p>
            </CardContent>
          </Card>
        </div>
      </AnimationTransitionPage>
    );
  }

  return (
    <AnimationTransitionPage>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header com título moderno */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Factory className="h-8 w-8" />
                    Registro de Produção
                  </h1>
                  <p className="text-emerald-100">
                    Controle de insumos utilizados e cálculo de métricas de produção
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-8 w-8 text-emerald-200" />
                    <div className="text-right">
                      <p className="text-xs text-emerald-200">Insumos</p>
                      <p className="text-lg font-bold">{items?.length || 0}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Sistema de Produção
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Alerta se não há insumos */}
          {(!items || items.length === 0) && (
            <div className="mb-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-300">
                      Nenhum insumo encontrado
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Este produto não possui insumos cadastrados. Você ainda pode registrar a produção com peso bruto.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulário */}
          <ProducaoForm produto={produto} items={items || []} />
        </div>
      </div>
    </AnimationTransitionPage>
  );
}
