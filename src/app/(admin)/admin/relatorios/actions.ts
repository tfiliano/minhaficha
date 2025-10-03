"use server";

import { createClient } from "@/utils/supabase";

export interface FiltrosRelatorio {
  dataInicio?: string;
  dataFim?: string;
  grupo?: string;
  produtoPai?: string;
  armazenamento?: string;
  setor?: string;
  itemCardapio?: string;
}

export interface DadoProducao {
  codigo: string;
  produto: string;
  produtoPai: string | null;
  data: string;
  responsavel: string;
  quantidade: number;
  peso: number;
  tipo: string;
  pesoMedio: number;
}

export interface DadoConversao {
  produto: string;
  produtoPai: string;
  data: string;
  responsavel: string;
  quantidade: number;
  pesoBruto: number;
  pesoLiquido: number;
  tipo: string;
  fc: number;
}

export interface DadoInsumo {
  dataRecebimento: string;
  produto: string;
  pesoBruto: number;
  fornecedor: string;
  notaFiscal: string;
  sif: string;
  temperatura: string;
  lote: string;
  validade: string;
  responsavel: string;
  confTransporte: string;
  confEmbalagem: string;
  confProdutos: string;
  observacoes: string;
}

export interface DadoMargem {
  grupo: string;
  codigo: string;
  descricao: string;
  precoVenda: number;
  precoCusto: number;
  margem: number;
}

export interface MetricasGerais {
  producaoTotal: number;
  custoMedio: number;
  metaAtingida: number;
  produtosAtivos: number;
}

export interface DadoProducaoMensal {
  mes: string;
  producao: number;
  meta: number;
}

export interface DadoGrupoProduto {
  name: string;
  value: number;
}

export interface DadoCustoMensal {
  mes: string;
  custo: number;
}

/**
 * Busca dados de produção do período
 */
export async function getDadosProducao(
  filtros: FiltrosRelatorio = {}
): Promise<DadoProducao[]> {
  const supabase = await createClient();

  console.log("🔍 getDadosProducao - Filtros recebidos:", filtros);

  // Converter IDs de filtros para nomes
  let grupoNome: string | null = null;
  let produtoPaiNome: string | null = null;

  if (filtros.grupo) {
    const { data: grupoData } = await supabase
      .from("grupos")
      .select("nome")
      .eq("id", filtros.grupo)
      .single();
    grupoNome = grupoData?.nome || null;
    console.log("📝 Grupo nome encontrado:", grupoNome);
  }

  if (filtros.produtoPai) {
    const { data: produtoData } = await supabase
      .from("produtos")
      .select("nome")
      .eq("id", filtros.produtoPai)
      .single();
    produtoPaiNome = produtoData?.nome || null;
    console.log("📝 Produto Pai nome encontrado:", produtoPaiNome);
  }

  let query = supabase
    .from("producoes")
    .select(
      `
      id,
      produto,
      produto_id,
      quantidade,
      peso_liquido,
      peso_bruto,
      created_at,
      items,
      operadores (nome),
      produtos (codigo, nome, grupo, originado, item_de_cardapio, armazenamento, setor)
    `
    )
    .order("created_at", { ascending: false });

  if (filtros.dataInicio) {
    query = query.gte("created_at", filtros.dataInicio);
  }
  if (filtros.dataFim) {
    query = query.lte("created_at", filtros.dataFim);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar produções:", error);
    return [];
  }

  // Agrupar por produto + data
  const agrupado = new Map<string, {
    codigo: string;
    produto: string;
    produtoPai: string | null;
    data: string;
    responsaveis: Set<string>;
    quantidade: number;
    peso: number;
    tipo: string;
  }>();

  let producoesFiltradas = 0;
  let producoesTotal = 0;

  (data || []).forEach((producao: any) => {
    producoesTotal++;
    const produto = producao.produtos;

    // Aplicar filtros (agora comparando nomes)
    if (grupoNome && produto?.grupo !== grupoNome) return;
    // Para produção, "produto pai" significa filtrar pelo próprio produto produzido (não pelo originado)
    if (produtoPaiNome && produto?.nome !== produtoPaiNome) {
      console.log(`❌ Filtrado - Produto: ${produto?.nome}, Esperado: ${produtoPaiNome}`);
      return;
    }
    if (filtros.armazenamento && produto?.armazenamento !== filtros.armazenamento) return;
    if (filtros.setor && produto?.setor !== filtros.setor) return;
    if (filtros.itemCardapio === "true" && !produto?.item_de_cardapio) return;

    producoesFiltradas++;

    const dataProd = new Date(producao.created_at).toLocaleDateString("pt-BR");
    const operador = producao.operadores?.nome || "N/A";
    const produtoPai = produto?.nome || "";
    const codigoPai = produto?.codigo || "";

    // Primeiro, adicionar o produto bruto (pai)
    const quantidadeBruto = Number(producao.quantidade) || 1;
    const pesoBruto = Number(producao.peso_bruto) || 1;
    const chavePai = `${codigoPai}-${dataProd}`;

    if (!agrupado.has(chavePai)) {
      agrupado.set(chavePai, {
        codigo: codigoPai,
        produto: produtoPai,
        produtoPai: null,
        data: dataProd,
        responsaveis: new Set([operador]),
        quantidade: 0,
        peso: 0,
        tipo: "Produto",
      });
    }

    const grupoPai = agrupado.get(chavePai)!;
    grupoPai.quantidade += quantidadeBruto;
    grupoPai.peso += pesoBruto;
    grupoPai.responsaveis.add(operador);

    // Depois, adicionar os sub-produtos (items)
    if (producao.items && Array.isArray(producao.items)) {
      producao.items.forEach((item: any) => {
        const nomeProduto = item.nome || "";
        const quantidade = Number(item.quantidade) || 0;
        const peso = Number(item.peso) || 0;

        // Usar nome como chave para sub-produtos (não têm código)
        const chave = `${nomeProduto}-${dataProd}`;

        if (!agrupado.has(chave)) {
          agrupado.set(chave, {
            codigo: "", // Sub-produtos não têm código próprio
            produto: nomeProduto,
            produtoPai: produtoPai,
            data: dataProd,
            responsaveis: new Set([operador]),
            quantidade: 0,
            peso: 0,
            tipo: "Sub-Produto",
          });
        }

        const grupo = agrupado.get(chave)!;
        grupo.quantidade += quantidade;
        grupo.peso += peso;
        grupo.responsaveis.add(operador);
      });
    }
  });

  console.log(`📊 Produções: ${producoesTotal} total, ${producoesFiltradas} após filtros`);
  console.log(`📦 Itens agrupados: ${agrupado.size}`);

  // Converter Map para array de resultados
  return Array.from(agrupado.values()).map((grupo) => {
    const pesoMedio = grupo.quantidade > 0 ? grupo.peso / grupo.quantidade : 0;

    // Juntar responsáveis únicos
    const responsaveis = Array.from(grupo.responsaveis).filter(r => r !== "N/A");
    const responsavel = responsaveis.length > 0
      ? responsaveis.length > 1
        ? `${responsaveis.length} operadores`
        : responsaveis[0]
      : "N/A";

    return {
      codigo: grupo.codigo,
      produto: grupo.produto,
      produtoPai: grupo.produtoPai,
      data: grupo.data,
      responsavel,
      quantidade: grupo.quantidade,
      peso: grupo.peso,
      tipo: grupo.tipo,
      pesoMedio,
    };
  }).sort((a, b) => {
    // Ordenar por data (mais recente primeiro), depois por tipo (Produto antes de Sub-Produto), depois por nome
    const dataA = a.data.split('/').reverse().join('');
    const dataB = b.data.split('/').reverse().join('');
    if (dataB !== dataA) return dataB.localeCompare(dataA);
    if (a.tipo !== b.tipo) return a.tipo === "Produto" ? -1 : 1;
    return a.produto.localeCompare(b.produto);
  });
}

/**
 * Busca dados de fator de correção (FC = Peso Bruto / Peso Líquido)
 * Agrupa por produto + data
 */
export async function getDadosConversao(filtros: FiltrosRelatorio = {}): Promise<DadoConversao[]> {
  const supabase = await createClient();

  console.log("🔍 getDadosConversao - Filtros recebidos:", filtros);

  // Converter IDs de filtros para nomes
  let grupoNome: string | null = null;
  let produtoPaiNome: string | null = null;

  if (filtros.grupo) {
    const { data: grupoData } = await supabase
      .from("grupos")
      .select("nome")
      .eq("id", filtros.grupo)
      .single();
    grupoNome = grupoData?.nome || null;
    console.log("📝 Grupo nome encontrado:", grupoNome);
  }

  if (filtros.produtoPai) {
    const { data: produtoData } = await supabase
      .from("produtos")
      .select("nome")
      .eq("id", filtros.produtoPai)
      .single();
    produtoPaiNome = produtoData?.nome || null;
    console.log("📝 Produto Pai nome encontrado (para originado):", produtoPaiNome);
  }

  // Buscar produções
  let query = supabase
    .from("producoes")
    .select(`
      id,
      created_at,
      quantidade,
      peso_bruto,
      peso_liquido,
      operadores (nome),
      produtos (codigo, nome, grupo, originado, item_de_cardapio, armazenamento, setor)
    `)
    .order("created_at", { ascending: false });

  if (filtros.dataInicio) {
    query = query.gte("created_at", filtros.dataInicio);
  }
  if (filtros.dataFim) {
    query = query.lte("created_at", filtros.dataFim);
  }

  const { data, error} = await query;

  if (error) {
    console.error("Erro ao buscar dados de correção:", error);
    return [];
  }

  // Agrupar por produto + data
  const agrupado = new Map<string, {
    produto: string;
    produtoPai: string;
    data: string;
    responsavel: string;
    quantidade: number;
    pesoBruto: number;
    pesoLiquido: number;
  }>();

  let conversaoTotal = 0;
  let conversaoFiltradas = 0;

  (data || []).forEach((producao: any) => {
    conversaoTotal++;
    const produtoObj = producao.produtos;

    // Aplicar filtros (agora comparando nomes)
    if (grupoNome && produtoObj?.grupo !== grupoNome) return;
    // Para conversão, "produto pai" significa filtrar pelo próprio produto (não pelo originado)
    if (produtoPaiNome && produtoObj?.nome !== produtoPaiNome) {
      console.log(`❌ Conversão filtrado - Produto: ${produtoObj?.nome}, Esperado: ${produtoPaiNome}`);
      return;
    }
    if (filtros.armazenamento && produtoObj?.armazenamento !== filtros.armazenamento) return;
    if (filtros.setor && produtoObj?.setor !== filtros.setor) return;
    if (filtros.itemCardapio === "true" && !produtoObj?.item_de_cardapio) return;

    conversaoFiltradas++;

    const dataProd = new Date(producao.created_at).toLocaleDateString("pt-BR");
    const operador = producao.operadores?.nome || "N/A";
    const produto = produtoObj?.nome || "N/A";

    const quantidade = Number(producao.quantidade) || 0;
    const pesoBruto = Number(producao.peso_bruto) || 0;
    const pesoLiquido = Number(producao.peso_liquido) || 0;

    // Chave única: produto + data
    const chave = `${produto}-${dataProd}`;

    if (!agrupado.has(chave)) {
      agrupado.set(chave, {
        produto,
        produtoPai: produto, // Produto pai é o mesmo (apenas produtos brutos)
        data: dataProd,
        responsavel: operador,
        quantidade: 0,
        pesoBruto: 0,
        pesoLiquido: 0,
      });
    }

    const grupo = agrupado.get(chave)!;
    grupo.quantidade += quantidade;
    grupo.pesoBruto += pesoBruto;
    grupo.pesoLiquido += pesoLiquido;
  });

  console.log(`📊 Conversão: ${conversaoTotal} total, ${conversaoFiltradas} após filtros`);
  console.log(`📦 Conversão - Itens agrupados: ${agrupado.size}`);

  // Converter para array e calcular FC
  const resultado = Array.from(agrupado.values())
    .map((grupo) => {
      const fc = grupo.pesoLiquido > 0 ? grupo.pesoBruto / grupo.pesoLiquido : 0;

      return {
        produto: grupo.produto,
        produtoPai: grupo.produtoPai,
        data: grupo.data,
        responsavel: grupo.responsavel,
        quantidade: grupo.quantidade,
        pesoBruto: grupo.pesoBruto,
        pesoLiquido: grupo.pesoLiquido,
        tipo: "Produto",
        fc: Number(fc.toFixed(2)),
      };
    })
    .sort((a, b) => {
      // Ordenar por data (mais recente primeiro) e depois por produto
      const dataA = a.data.split('/').reverse().join('');
      const dataB = b.data.split('/').reverse().join('');
      if (dataB !== dataA) return dataB.localeCompare(dataA);
      return a.produto.localeCompare(b.produto);
    });

  return resultado;
}

/**
 * Busca dados de entradas de insumos/recebimentos
 */
export async function getDadosInsumos(
  filtros: FiltrosRelatorio = {}
): Promise<DadoInsumo[]> {
  const supabase = await createClient();

  // Converter IDs de filtros para nomes
  let grupoNome: string | null = null;
  let produtoPaiNome: string | null = null;

  if (filtros.grupo) {
    const { data: grupoData } = await supabase
      .from("grupos")
      .select("nome")
      .eq("id", filtros.grupo)
      .single();
    grupoNome = grupoData?.nome || null;
  }

  if (filtros.produtoPai) {
    const { data: produtoData } = await supabase
      .from("produtos")
      .select("nome")
      .eq("id", filtros.produtoPai)
      .single();
    produtoPaiNome = produtoData?.nome || null;
  }

  let query = supabase
    .from("recebimentos")
    .select(`
      *,
      produtos!entrada_insumos_produto_id_fkey (nome, grupo, originado, item_de_cardapio, armazenamento, setor),
      operadores (nome)
    `)
    .order("data_recebimento", { ascending: false });

  if (filtros.dataInicio) {
    query = query.gte("data_recebimento", filtros.dataInicio);
  }
  if (filtros.dataFim) {
    query = query.lte("data_recebimento", filtros.dataFim);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar recebimentos:", error);
    return [];
  }

  return (data || [])
    .filter((item: any) => {
      const produto = item.produtos;

      // Aplicar filtros (agora comparando nomes)
      if (grupoNome && produto?.grupo !== grupoNome) return false;
      // Para insumos, "produto pai" significa filtrar pelo próprio produto
      if (produtoPaiNome && produto?.nome !== produtoPaiNome) return false;
      if (filtros.armazenamento && produto?.armazenamento !== filtros.armazenamento) return false;
      if (filtros.setor && produto?.setor !== filtros.setor) return false;
      if (filtros.itemCardapio === "true" && !produto?.item_de_cardapio) return false;

      return true;
    })
    .map((item: any) => {
    const dataRecebimento = item.data_recebimento
      ? new Date(item.data_recebimento).toLocaleDateString("pt-BR")
      : "";
    const dataValidade = item.validade
      ? new Date(item.validade).toLocaleDateString("pt-BR")
      : "";

    // Converter conformidades para texto legível
    const confTransporte = item.conformidade_transporte === 'C' ? 'Conforme' :
                          item.conformidade_transporte === 'N' ? 'Não Conforme' :
                          item.conformidade_transporte || '';

    const confEmbalagem = item.conformidade_embalagem === 'C' ? 'Conforme' :
                         item.conformidade_embalagem === 'N' ? 'Não Conforme' :
                         item.conformidade_embalagem || '';

    const confProdutos = item.conformidade_produtos === 'C' ? 'Conforme' :
                        item.conformidade_produtos === 'N' ? 'Não Conforme' :
                        item.conformidade_produtos || '';

    return {
      dataRecebimento,
      produto: item.produtos?.nome || "N/A",
      pesoBruto: Number(item.peso_bruto) || 0,
      fornecedor: item.fornecedor || "",
      notaFiscal: item.nota_fiscal || "",
      sif: item.sif || "",
      temperatura: item.temperatura || "",
      lote: item.lote || "",
      validade: dataValidade,
      responsavel: item.operadores?.nome || "N/A",
      confTransporte,
      confEmbalagem,
      confProdutos,
      observacoes: item.observacoes || "",
    };
  });
}

/**
 * Busca dados de margem de contribuição por produto (itens de cardápio)
 */
export async function getDadosMargem(filtros: FiltrosRelatorio = {}): Promise<DadoMargem[]> {
  const supabase = await createClient();

  console.log("🔍 getDadosMargem - Filtros recebidos:", filtros);

  let query = supabase
    .from("produtos")
    .select(`
      codigo,
      nome,
      preco_venda,
      custo_unitario,
      grupo,
      originado,
      armazenamento,
      setor,
      item_de_cardapio,
      grupos (nome)
    `)
    .eq("ativo", true);

  // Filtro de item de cardápio (obrigatório para relatório de margem)
  query = query.eq("item_de_cardapio", true);

  // Filtro de grupo - buscar o nome do grupo pelo ID
  if (filtros.grupo) {
    console.log("✅ Aplicando filtro de grupo (ID):", filtros.grupo);

    // Buscar o nome do grupo pelo ID
    const { data: grupoData } = await supabase
      .from("grupos")
      .select("nome")
      .eq("id", filtros.grupo)
      .single();

    if (grupoData) {
      console.log("📝 Nome do grupo encontrado:", grupoData.nome);
      query = query.eq("grupo", grupoData.nome);
    } else {
      console.log("❌ Grupo não encontrado para o ID:", filtros.grupo);
    }
  }
  if (filtros.produtoPai) {
    query = query.eq("originado", filtros.produtoPai);
  }
  if (filtros.armazenamento) {
    query = query.eq("armazenamento", filtros.armazenamento);
  }
  if (filtros.setor) {
    query = query.eq("setor", filtros.setor);
  }

  query = query.order("grupos(nome)", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar produtos para margem:", error);
    return [];
  }

  console.log("📊 Produtos retornados:", data?.length || 0);
  console.log("📋 Amostra dos produtos:", data?.slice(0, 3));

  return (data || []).map((produto: any) => {
    const precoVenda = Number(produto.preco_venda) || 0;
    const precoCusto = Number(produto.custo_unitario) || 0;

    // Calcular margem: Preço Venda / Preço Custo
    let margem = 0;
    if (precoCusto > 0 && precoVenda > 0) {
      margem = precoVenda / precoCusto;
    }

    return {
      grupo: produto.grupos?.nome || "Sem Grupo",
      codigo: produto.codigo || "",
      descricao: produto.nome || "",
      precoVenda,
      precoCusto,
      margem,
    };
  });
}

/**
 * Busca métricas gerais do dashboard
 */
export async function getMetricasGerais(): Promise<MetricasGerais> {
  const supabase = await createClient();

  // Produção total do mês atual
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const { data: producoes } = await supabase
    .from("producoes")
    .select("quantidade")
    .gte("created_at", inicioMes.toISOString());

  const producaoTotal = (producoes || []).reduce(
    (acc: number, p: any) => acc + (p.quantidade || 0),
    0
  );

  // Produtos ativos
  const { count: produtosAtivos } = await supabase
    .from("produtos")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true);

  // Custo médio (média dos custos unitários)
  const { data: produtos } = await supabase
    .from("produtos")
    .select("custo_unitario")
    .eq("ativo", true)
    .not("custo_unitario", "is", null);

  const custoMedio = produtos && produtos.length > 0
    ? produtos.reduce((acc: number, p: any) => acc + (p.custo_unitario || 0), 0) / produtos.length
    : 0;

  return {
    producaoTotal,
    custoMedio,
    metaAtingida: 100, // TODO: definir lógica de meta
    produtosAtivos: produtosAtivos || 0,
  };
}

/**
 * Busca dados de produção mensal (últimos 6 meses)
 */
export async function getDadosProducaoMensal(): Promise<DadoProducaoMensal[]> {
  const supabase = await createClient();

  // Buscar produções dos últimos 6 meses
  const seiseMesesAtras = new Date();
  seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);

  const { data, error } = await supabase
    .from("producoes")
    .select("created_at, quantidade")
    .gte("created_at", seiseMesesAtras.toISOString());

  if (error || !data) {
    return [];
  }

  // Agrupar por mês
  const mesesMap = new Map<string, number>();
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  data.forEach((item: any) => {
    const data = new Date(item.created_at);
    const mesAno = `${meses[data.getMonth()]}`;

    if (!mesesMap.has(mesAno)) {
      mesesMap.set(mesAno, 0);
    }
    mesesMap.set(mesAno, mesesMap.get(mesAno)! + (item.quantidade || 0));
  });

  // Criar array com os últimos 6 meses
  const resultado: DadoProducaoMensal[] = [];
  for (let i = 5; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    const mes = meses[data.getMonth()];
    const producao = mesesMap.get(mes) || 0;

    resultado.push({
      mes,
      producao,
      meta: producao * 0.9, // Meta é 90% da produção atual (placeholder)
    });
  }

  return resultado;
}

/**
 * Busca distribuição de produtos por grupo
 */
export async function getDadosProdutosPorGrupo(): Promise<DadoGrupoProduto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("produtos")
    .select("grupo")
    .eq("ativo", true);

  if (error || !data) {
    return [];
  }

  // Agrupar e contar
  const gruposMap = new Map<string, number>();
  data.forEach((item: any) => {
    const grupo = item.grupo || "Sem Grupo";
    gruposMap.set(grupo, (gruposMap.get(grupo) || 0) + 1);
  });

  return Array.from(gruposMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));
}

/**
 * Busca tendência de custos mensais
 */
export async function getDadosCustoMensal(): Promise<DadoCustoMensal[]> {
  const supabase = await createClient();

  // Buscar recebimentos dos últimos 6 meses
  const seiseMesesAtras = new Date();
  seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);

  const { data, error } = await supabase
    .from("recebimentos")
    .select("created_at, peso_bruto")
    .gte("created_at", seiseMesesAtras.toISOString());

  if (error || !data) {
    return [];
  }

  // Agrupar por mês (usando peso como proxy de custo)
  const mesesMap = new Map<string, number>();
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  data.forEach((item: any) => {
    const data = new Date(item.created_at);
    const mesAno = `${meses[data.getMonth()]}`;

    if (!mesesMap.has(mesAno)) {
      mesesMap.set(mesAno, 0);
    }
    // Usando peso_bruto como proxy de custo (multiplicado por 100 para simular valores)
    mesesMap.set(mesAno, mesesMap.get(mesAno)! + ((item.peso_bruto || 0) * 100));
  });

  // Criar array com os últimos 6 meses
  const resultado: DadoCustoMensal[] = [];
  for (let i = 5; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    const mes = meses[data.getMonth()];
    const custo = mesesMap.get(mes) || 0;

    resultado.push({
      mes,
      custo,
    });
  }

  return resultado;
}

/**
 * Tipo para comparação de períodos
 */
export type ComparativoPeriodos = {
  periodoAtual: {
    totalProducao: number;
    totalInsumos: number;
    custoMedio: number;
    produtosUnicos: number;
  };
  periodoAnterior: {
    totalProducao: number;
    totalInsumos: number;
    custoMedio: number;
    produtosUnicos: number;
  };
  variacoes: {
    producao: number; // percentual
    insumos: number;
    custoMedio: number;
    produtosUnicos: number;
  };
};

/**
 * Compara o período atual com o período anterior de mesmo tamanho
 */
export async function getComparativoPeriodos(
  filtros: FiltrosRelatorio = {}
): Promise<ComparativoPeriodos> {
  const supabase = await createClient();

  // Calcular período anterior baseado no tamanho do período atual
  let dataInicioAtual: Date;
  let dataFimAtual: Date;
  let dataInicioAnterior: Date;
  let dataFimAnterior: Date;

  if (filtros.dataInicio && filtros.dataFim) {
    dataInicioAtual = new Date(filtros.dataInicio);
    dataFimAtual = new Date(filtros.dataFim);

    // Calcular duração do período em dias
    const duracaoDias = Math.ceil((dataFimAtual.getTime() - dataInicioAtual.getTime()) / (1000 * 60 * 60 * 24));

    // Período anterior: mesmo número de dias antes
    dataFimAnterior = new Date(dataInicioAtual);
    dataFimAnterior.setDate(dataFimAnterior.getDate() - 1); // Um dia antes do início atual
    dataInicioAnterior = new Date(dataFimAnterior);
    dataInicioAnterior.setDate(dataInicioAnterior.getDate() - duracaoDias + 1);
  } else {
    // Se não tem filtro de data, usa o mês atual vs mês anterior
    const hoje = new Date();
    dataFimAtual = hoje;
    dataInicioAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    dataFimAnterior = new Date(dataInicioAtual);
    dataFimAnterior.setDate(dataFimAnterior.getDate() - 1);
    dataInicioAnterior = new Date(dataFimAnterior.getFullYear(), dataFimAnterior.getMonth(), 1);
  }

  // Buscar dados do período atual
  const { data: producoesAtual } = await supabase
    .from("producoes")
    .select("quantidade, peso_bruto, produto_id")
    .gte("created_at", dataInicioAtual.toISOString())
    .lte("created_at", dataFimAtual.toISOString());

  const { data: insumosAtual } = await supabase
    .from("recebimentos")
    .select("peso_bruto, produto_id")
    .gte("created_at", dataInicioAtual.toISOString())
    .lte("created_at", dataFimAtual.toISOString());

  // Buscar dados do período anterior
  const { data: producoesAnterior } = await supabase
    .from("producoes")
    .select("quantidade, peso_bruto, produto_id")
    .gte("created_at", dataInicioAnterior.toISOString())
    .lte("created_at", dataFimAnterior.toISOString());

  const { data: insumosAnterior } = await supabase
    .from("recebimentos")
    .select("peso_bruto, produto_id")
    .gte("created_at", dataInicioAnterior.toISOString())
    .lte("created_at", dataFimAnterior.toISOString());

  // Calcular métricas período atual
  const totalProducaoAtual = (producoesAtual || []).reduce(
    (sum: number, p: any) => sum + (Number(p.quantidade) || 0),
    0
  );
  const totalInsumosAtual = (insumosAtual || []).reduce(
    (sum: number, i: any) => sum + (Number(i.peso_bruto) || 0),
    0
  );
  const custoMedioAtual = totalProducaoAtual > 0 ? totalInsumosAtual / totalProducaoAtual : 0;
  const produtosUnicosAtual = new Set((producoesAtual || []).map((p: any) => p.produto_id)).size;

  // Calcular métricas período anterior
  const totalProducaoAnterior = (producoesAnterior || []).reduce(
    (sum: number, p: any) => sum + (Number(p.quantidade) || 0),
    0
  );
  const totalInsumosAnterior = (insumosAnterior || []).reduce(
    (sum: number, i: any) => sum + (Number(i.peso_bruto) || 0),
    0
  );
  const custoMedioAnterior = totalProducaoAnterior > 0 ? totalInsumosAnterior / totalProducaoAnterior : 0;
  const produtosUnicosAnterior = new Set((producoesAnterior || []).map((p: any) => p.produto_id)).size;

  // Calcular variações percentuais
  const calcularVariacao = (atual: number, anterior: number): number => {
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return ((atual - anterior) / anterior) * 100;
  };

  return {
    periodoAtual: {
      totalProducao: totalProducaoAtual,
      totalInsumos: totalInsumosAtual,
      custoMedio: custoMedioAtual,
      produtosUnicos: produtosUnicosAtual,
    },
    periodoAnterior: {
      totalProducao: totalProducaoAnterior,
      totalInsumos: totalInsumosAnterior,
      custoMedio: custoMedioAnterior,
      produtosUnicos: produtosUnicosAnterior,
    },
    variacoes: {
      producao: calcularVariacao(totalProducaoAtual, totalProducaoAnterior),
      insumos: calcularVariacao(totalInsumosAtual, totalInsumosAnterior),
      custoMedio: calcularVariacao(custoMedioAtual, custoMedioAnterior),
      produtosUnicos: calcularVariacao(produtosUnicosAtual, produtosUnicosAnterior),
    },
  };
}
