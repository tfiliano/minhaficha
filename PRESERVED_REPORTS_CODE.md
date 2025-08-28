# Código Preservado dos Relatórios - Para Uso Futuro

Este arquivo contém o código dos relatórios que foram removidos da interface principal, mas que serão utilizados em outros locais do sistema.

## Dashboard de Produção

Para uso em outro menu/localização:

```tsx
<AnalyticsCard
  title="Dashboard de Produção"
  description="Visão completa com gráficos e métricas de desempenho"
  icon={BarChart3}
  href="/admin/reports/dashboard"
  color="blue"
  metrics="Gráficos interativos • Filtros avançados • KPIs em tempo real"
/>
```

## Relatórios de Exportação Rápida

Código completo para implementação futura:

```tsx
// Estados necessários
const [itemsProducao, setItemsProducao] = useState<Option[]>([]);
const [itemsCorrecao, setItemsCorrecao] = useState<Option[]>([]);
const [itemsMovimentacao, setItemsMovimentacao] = useState<Option[]>([]);

// Função de exportação com filtros de produtos
const handleExportReport = async (
  endpoint: string,
  selectedItems: Option[],
  filename: string,
  dateRange?: DateRange
) => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        items: selectedItems.map((item) => item.value),
        dateRange,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Falha ao gerar o relatório");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
    toast.success(`Relatório ${filename} baixado com sucesso!`);
  } catch (error: any) {
    toast.error(error.message || "Erro ao exportar relatório");
  }
};

// Cards dos relatórios
<div>
  <div className="flex items-center gap-3 mb-6">
    <Download className="h-6 w-6 text-slate-600 dark:text-slate-400" />
    <div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        Exportação Rápida
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Configure filtros avançados e exporte dados diretamente para Excel
      </p>
    </div>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <QuickReportCardWithProducts
      title="Relatório de Produção"
      description="Dados completos de produção com detalhes de peso e operadores"
      icon={TrendingUp}
      selectedItems={itemsProducao}
      setSelectedItems={setItemsProducao}
      endpoint="/api/reports/producao/excel"
      filename="relatorio_producao.xlsx"
      color="green"
    />

    <QuickReportCardWithProducts
      title="Fator de Correção"
      description="Análise de fatores de correção aplicados na produção"
      icon={PieChart}
      selectedItems={itemsCorrecao}
      setSelectedItems={setItemsCorrecao}
      endpoint="/api/reports/correcao/excel"
      filename="relatorio_correcao.xlsx"
      color="amber"
    />

    <QuickReportCardWithProducts
      title="Movimentação"
      description="Histórico detalhado de movimentações de produtos"
      icon={Activity}
      selectedItems={itemsMovimentacao}
      setSelectedItems={setItemsMovimentacao}
      endpoint="/api/reports/movimentacao/excel"
      filename="relatorio_movimentacao.xlsx"
      color="purple"
    />
  </div>
</div>
```

## Imports Necessários

Para implementar os relatórios completos:

```tsx
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { Activity, Eye } from "lucide-react";
import Link from "next/link";

type Option = { value: string; label: string };
```

## Componente AnalyticsCard

```tsx
const AnalyticsCard = ({
  title,
  description,
  icon: Icon,
  href,
  color = "slate",
  metrics,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color?: "slate" | "blue" | "green" | "purple";
  metrics?: string;
}) => {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 hover:border-slate-300 dark:hover:border-slate-600">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {metrics && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">{metrics}</p>
          </div>
        )}
        
        <Button asChild className="w-full">
          <Link href={href}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar Relatório
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
```

## Nota de Implementação

- O código está pronto para ser reutilizado
- Basta ajustar os endpoints da API conforme necessário
- Os componentes seguem o mesmo padrão visual das outras telas modernizadas
- MultipleSelector já está configurado para seleção de produtos
- Filtros de data e produtos funcionam em conjunto