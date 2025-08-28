import { createClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import { AnimationTransitionPage } from "../../../components/animation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Printer, AlertCircle, FileText } from "lucide-react";
import { GerarEtiquetaForm } from "@/components/pages";

type Props = {
  params?: Promise<{}>;
  searchParams?: Promise<{
    operador?: string;
    operacao?: string;
    setor?: string;
    produto?: string;
  }>;
};

export default async function GerarEtiquetaPage(props: Props) {
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

  // Verificar se há templates e impressoras disponíveis
  const { data: templates } = await supabase
    .from("templates_etiquetas")
    .select("id, nome")
    .eq("ativo", true);

  const { data: impressoras } = await supabase
    .from("impressoras")
    .select("id, nome")
    .eq("ativa", true);

  if (!produto) {
    return (
      <AnimationTransitionPage>
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6 mb-6">
                <Tag className="h-12 w-12 text-red-500" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header com título moderno */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Tag className="h-8 w-8" />
                    Geração de Etiquetas
                  </h1>
                  <p className="text-blue-100">
                    Configure e imprima etiquetas personalizadas para seus produtos
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-center gap-2">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-blue-200 mx-auto" />
                      <p className="text-xs text-blue-200 mt-1">Templates</p>
                      <p className="text-lg font-bold">{templates?.length || 0}</p>
                    </div>
                    <div className="text-center">
                      <Printer className="h-8 w-8 text-blue-200 mx-auto" />
                      <p className="text-xs text-blue-200 mt-1">Impressoras</p>
                      <p className="text-lg font-bold">{impressoras?.length || 0}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Sistema de Etiquetas
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas de configuração */}
          {(!templates || templates.length === 0) && (
            <div className="mb-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-300">
                      Nenhum template encontrado
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Configure templates de etiquetas na seção de administração antes de gerar etiquetas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(!impressoras || impressoras.length === 0) && (
            <div className="mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-300">
                      Nenhuma impressora ativa
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Configure impressoras ativas na seção de administração para poder imprimir etiquetas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulário */}
          <GerarEtiquetaForm produto={produto} />
        </div>
      </div>
    </AnimationTransitionPage>
  );
}
