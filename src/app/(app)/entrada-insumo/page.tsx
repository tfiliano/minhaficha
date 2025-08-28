import { EntradaInsumoForm } from "@/components/pages/entrada-insumo-form";
import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import { AnimationTransitionPage } from "../../../components/animation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, ClipboardCheck } from "lucide-react";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operador?: string;
    operacao?: string;
    setor?: string;
    produto?: string;
  }>;
};

export default async function EntradaInsumoPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(searchParams);

  if (!params.get("produto")) {
    return redirect("/");
  }
  
  const supabase = await createClient();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header com título moderno */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Truck className="h-8 w-8" />
                    Entrada de Insumos
                  </h1>
                  <p className="text-blue-100">
                    Registro de recebimento e análise de conformidade
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-center gap-2">
                  <ClipboardCheck className="h-12 w-12 text-blue-200" />
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Sistema de Qualidade
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <EntradaInsumoForm produto={produto} />
        </div>
      </div>
    </AnimationTransitionPage>
  );
}
