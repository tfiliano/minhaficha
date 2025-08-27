import { createClient } from "@/utils/supabase";
import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Tipos explícitos baseados na estrutura do banco
type ProducaoItem = {
  nome: string;
  peso: number;
  quantidade: number;
  peso_medio: number;
};

type Producao = {
  id: string;
  created_at: string;
  peso_bruto: number;
  peso_liquido: number;
  quantidade: number;
  operador_id?: string;
  produto_id?: string;
  items?: ProducaoItem[];
  produtos?: {
    nome: string;
  };
  operadores?: {
    nome: string;
  };
};

export async function POST(request: Request) {
  try {
    const { dateRange } = await request.json();

    if (!dateRange?.from || !dateRange?.to) {
      return NextResponse.json(
        { error: "Período obrigatório" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    console.log("Filtros recebidos:", { from: dateRange.from, to: dateRange.to });

    // Verificar se é o sistema multi-tenancy que está bloqueando
    console.log("=== DEBUGING MULTI-TENANCY ===");
    
    // Teste com admin client (sem filtro de loja)
    const supabaseAdmin = await createSupabaseServerAdmin();
    const { data: adminProducoes, error: adminError } = await supabaseAdmin
      .from("producoes")
      .select("id, loja_id, created_at")
      .limit(5);
    
    console.log("Total com cliente ADMIN (sem filtro loja):", adminProducoes?.length || 0);
    if (adminProducoes && adminProducoes.length > 0) {
      console.log("Primeiras produções ADMIN:");
      adminProducoes.forEach((p, i) => {
        console.log(`${i+1}:`, { id: p.id, loja_id: p.loja_id, created_at: p.created_at });
      });
    }
    
    // Primeiro, vamos verificar se existem dados na tabela COM filtros automáticos
    const { data: totalProducoes, error: totalError } = await supabase
      .from("producoes")
      .select("id, loja_id, created_at")
      .limit(5);

    console.log("Total com cliente NORMAL (com filtro loja):", totalProducoes?.length || 0);
    
    if (totalProducoes && totalProducoes.length > 0) {
      console.log("Primeiras produções NORMAL:");
      totalProducoes.forEach((p, i) => {
        console.log(`${i+1}:`, { id: p.id, loja_id: p.loja_id, created_at: p.created_at });
      });
    }

    // Buscar produções no período especificado
    const { data: producoes, error } = await supabase
      .from("producoes")
      .select(`
        *,
        produtos (
          nome
        ),
        operadores (
          nome
        )
      `)
      .gte("created_at", dateRange.from)
      .lte("created_at", dateRange.to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro na consulta:", error);
      throw error;
    }
    
    console.log("Produções encontradas no período:", producoes?.length || 0);
    
    if (producoes && producoes.length > 0) {
      console.log("Primeira produção:", {
        id: producoes[0].id,
        created_at: producoes[0].created_at,
        produto: producoes[0].produtos?.nome,
        operador: producoes[0].operadores?.nome
      });
    }

    // Se não há dados, vamos retornar um arquivo com mensagem informativa
    if (!producoes || producoes.length === 0) {
      const emptyData = [
        ["Produto", "Produto Pai", "Data", "Responsável", "Quantidade", "Peso", "Tipo", "Peso Médio"],
        ["Nenhuma produção encontrada no período selecionado", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["Dica: Verifique se existem dados de produção", "", "", "", "", "", "", ""],
        ["no período selecionado ou se você tem", "", "", "", "", "", "", ""],
        ["permissão para visualizar estes dados.", "", "", "", "", "", "", ""]
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(emptyData);
      
      ws['!cols'] = [
        { wch: 30 }, { wch: 30 }, { wch: 12 }, { wch: 20 }, 
        { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, "Relatório de Produção V2");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=relatorio_producao_v2_vazio.xlsx",
        },
      });
    }

    // Preparar dados para o Excel baseado no formato do arquivo de exemplo
    const excelData: any[] = [];

    // Headers
    const headers = [
      "Produto",
      "Produto Pai", 
      "Data",
      "Responsável",
      "Quantidade",
      "Peso",
      "Tipo",
      "Peso Médio"
    ];

    // Processar cada produção
    (producoes as unknown as Producao[]).forEach((producao) => {
      const dataProd = new Date(producao.created_at).toLocaleDateString('pt-BR');
      const operador = producao.operadores?.nome || "Não informado";
      const produtoPai = producao.produtos?.nome || "Produto não identificado";
      
      const quantidade = Number(producao.quantidade) || 1;
      const pesoBruto = Number(producao.peso_bruto) || 0;
      const pesoMedio = quantidade > 0 ? pesoBruto / quantidade : 0;

      // Linha do produto principal
      excelData.push([
        produtoPai,          // Produto
        "",                  // Produto Pai (vazio para o principal)
        dataProd,           // Data
        operador,           // Responsável
        quantidade,         // Quantidade
        pesoBruto,          // Peso
        "Produto",          // Tipo
        pesoMedio           // Peso Médio
      ]);

      // Linhas dos sub-produtos (items) - items está em formato JSON
      let items: ProducaoItem[] = [];
      try {
        if (producao.items && typeof producao.items === 'string') {
          items = JSON.parse(producao.items);
        } else if (producao.items && Array.isArray(producao.items)) {
          items = producao.items as ProducaoItem[];
        } else if (producao.items && typeof producao.items === 'object') {
          items = producao.items as ProducaoItem[];
        }
      } catch (e) {
        console.warn("Erro ao parsear items JSON:", e);
        items = [];
      }

      if (items && items.length > 0) {
        items.forEach((item: ProducaoItem) => {
          const quantidadeItem = Number(item.quantidade) || 0;
          const pesoItem = Number(item.peso) || 0;
          const pesoMedioItem = quantidadeItem > 0 ? pesoItem / quantidadeItem : 0;

          excelData.push([
            item.nome,          // Produto
            produtoPai,         // Produto Pai
            dataProd,           // Data
            operador,           // Responsável
            quantidadeItem,     // Quantidade
            pesoItem,           // Peso
            "Sub-Produto",      // Tipo
            pesoMedioItem       // Peso Médio
          ]);
        });
      }
    });

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Criar worksheet com headers e dados
    const wsData = [headers, ...excelData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Configurar larguras das colunas
    ws['!cols'] = [
      { wch: 30 }, // Produto
      { wch: 30 }, // Produto Pai
      { wch: 12 }, // Data
      { wch: 20 }, // Responsável
      { wch: 12 }, // Quantidade
      { wch: 12 }, // Peso
      { wch: 15 }, // Tipo
      { wch: 12 }  // Peso Médio
    ];

    // Estilizar cabeçalho
    const range = XLSX.utils.decode_range(ws["!ref"]!);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const headerAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[headerAddress]) ws[headerAddress] = { v: "" };
      if (!ws[headerAddress].s) ws[headerAddress].s = {};
      
      ws[headerAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "366092" } },
        alignment: { horizontal: "center" }
      };
    }

    // Estilizar células de dados
    for (let R = 1; R <= range.e.r; R++) {
      for (let C = 0; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        
        if (!ws[cellAddress].s) ws[cellAddress].s = {};

        // Formatação de números
        if (C === 4) { // Quantidade - sem casas decimais
          ws[cellAddress].t = "n";
          ws[cellAddress].z = "0";
          ws[cellAddress].s.alignment = { horizontal: "right" };
        } else if (C === 5 || C === 7) { // Peso e Peso Médio - 3 casas decimais
          ws[cellAddress].t = "n";
          ws[cellAddress].z = "0.000";
          ws[cellAddress].s.alignment = { horizontal: "right" };
        } else {
          // Texto alinhado à esquerda
          ws[cellAddress].s.alignment = { horizontal: "left" };
        }

        // Cores alternadas nas linhas
        if (R % 2 === 0) {
          ws[cellAddress].s.fill = { fgColor: { rgb: "F8F9FA" } };
        }
      }
    }

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Produção V2");

    // Gerar buffer
    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=relatorio_producao_v2.xlsx",
      },
    });

  } catch (error: any) {
    console.error("Erro ao gerar Excel:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao gerar Excel" },
      { status: 500 }
    );
  }
}