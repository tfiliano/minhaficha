import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  TrendingUp,
  DollarSign,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Boxes,
  Truck,
} from "lucide-react";
import {
  getDadosProducao,
  getDadosConversao,
  getDadosInsumos,
  getDadosMargem,
  getMetricasGerais,
} from "./actions";
import { RelatoriosClient } from "./page-client";
import { FiltrosWrapper } from "./filtros-wrapper";
import { ExportButtons } from "./export-buttons";

interface PageProps {
  searchParams: Promise<{
    dataInicio?: string;
    dataFim?: string;
    grupo?: string;
    produtoPai?: string;
    armazenamento?: string;
    setor?: string;
    itemCardapio?: string;
  }>;
}

export default async function RelatoriosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Buscar opções de filtros do banco
  const { createClient } = await import("@/utils/supabase");
  const supabase = await createClient();

  const [gruposData, armazenamentosData, setoresData] = await Promise.all([
    supabase.from("grupos").select("id, nome").order("nome"),
    supabase.from("locais_armazenamento").select("id, armazenamento").order("armazenamento"),
    supabase.from("setores").select("id, nome").order("nome"),
  ]);

  // Buscar produtos pai (produtos que têm derivados)
  const { data: produtosComFilhos } = await supabase
    .from("produtos")
    .select("originado")
    .not("originado", "is", null);

  const idsOriginados = [...new Set(produtosComFilhos?.map((p: any) => p.originado) || [])];

  let produtosPaiData: any = { data: [] };
  if (idsOriginados.length > 0) {
    produtosPaiData = await supabase
      .from("produtos")
      .select("id, nome")
      .in("id", idsOriginados)
      .order("nome");
  }

  const grupos = gruposData.data || [];
  const produtosPai = produtosPaiData.data || [];
  const armazenamentos = armazenamentosData.data || [];
  const setores = setoresData.data || [];

  // Buscar todos os dados do banco com filtros
  const [
    dadosProducao,
    dadosConversao,
    dadosInsumos,
    dadosMargem,
    metricas,
  ] = await Promise.all([
    getDadosProducao(params),
    getDadosConversao(params),
    getDadosInsumos(params),
    getDadosMargem(params),
    getMetricasGerais(),
  ]);

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Relatórios
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Análise completa de produção, custos e performance
          </p>
        </div>

        {/* Export Buttons */}
        <ExportButtons />
      </div>

      {/* Floating Filtros */}
      <FiltrosWrapper
        grupos={grupos}
        produtosPai={produtosPai}
        armazenamentos={armazenamentos}
        setores={setores}
        floating={true}
      />

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Produção Total
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metricas.producaoTotal.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-slate-500 mt-1">unidades produzidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Custo Médio
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {metricas.custoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">por produto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Meta Atingida
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metricas.metaAtingida}%
            </div>
            <p className="text-xs text-slate-500 mt-1">do objetivo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Produtos Ativos
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metricas.produtosAtivos}
            </div>
            <p className="text-xs text-slate-500 mt-1">itens cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Analíticos */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Relatórios Analíticos
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Visualize e exporte dados detalhados por categoria
            </p>
          </div>
        </div>

        <RelatoriosClient
          dadosProducao={dadosProducao}
          dadosConversao={dadosConversao}
          dadosInsumos={dadosInsumos}
          dadosMargem={dadosMargem}
        />
      </div>
    </div>
  );
}
