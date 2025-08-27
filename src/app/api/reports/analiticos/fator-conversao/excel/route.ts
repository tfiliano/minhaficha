import { createClient } from "@/utils/supabase";
import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Tipos baseados na estrutura do FC
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

    console.log("Filtros recebidos para FC:", { from: dateRange.from, to: dateRange.to });

    // Buscar produções no período especificado para calcular fator de conversão
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
      console.error("Erro na consulta FC:", error);
      throw error;
    }
    
    console.log("Produções encontradas para FC:", producoes?.length || 0);

    // Se não há dados, retornar arquivo vazio com mensagem
    if (!producoes || producoes.length === 0) {
      const emptyData = [
        ["Produto", "Produto Pai", "Data", "Responsável", "Quantidade", "Peso Bruto", "Peso Líquido", "Tipo", "FC"],
        ["Nenhuma produção encontrada no período selecionado", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["Dica: Verifique se existem dados de produção", "", "", "", "", "", "", "", ""],
        ["no período selecionado ou se você tem", "", "", "", "", "", "", "", ""],
        ["permissão para visualizar estes dados.", "", "", "", "", "", "", "", ""]
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(emptyData);
      
      ws['!cols'] = [
        { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, 
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 8 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, "Fator de Conversão");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=relatorio_fc_vazio.xlsx",
        },
      });
    }

    // Agrupar produtos pai por data para calcular fator de conversão
    const gruposPorProdutoData = new Map<string, {
      produto: string;
      data: string;
      responsavel: string;
      quantidade: number;
      pesoBruto: number;
      pesoLiquido: number;
    }>();

    // Processar cada produção e agrupar por produto pai + data
    (producoes as unknown as Producao[]).forEach((producao) => {
      const dataProd = new Date(producao.created_at).toLocaleDateString('pt-BR');
      const operador = producao.operadores?.nome || "Super Usuario";
      const produtoPai = producao.produtos?.nome || "Produto não identificado";
      
      const quantidade = Number(producao.quantidade) || 1;
      const pesoBruto = Number(producao.peso_bruto) || 0;
      const pesoLiquido = Number(producao.peso_liquido) || 0;
      
      // Criar chave única para agrupar: produto + data
      const chave = `${produtoPai}_${dataProd}`;
      
      if (gruposPorProdutoData.has(chave)) {
        // Somar aos valores existentes
        const grupo = gruposPorProdutoData.get(chave)!;
        grupo.quantidade += quantidade;
        grupo.pesoBruto += pesoBruto;
        grupo.pesoLiquido += pesoLiquido;
      } else {
        // Criar novo grupo
        gruposPorProdutoData.set(chave, {
          produto: produtoPai,
          data: dataProd,
          responsavel: operador,
          quantidade,
          pesoBruto,
          pesoLiquido
        });
      }
    });

    // Preparar dados para o Excel baseado nos grupos
    const excelData: any[] = [];

    // Headers conforme o layout do FC
    const headers = [
      "Produto",
      "Produto Pai", 
      "Data",
      "Responsável",
      "Quantidade",
      "Peso Bruto",
      "Peso Líquido",
      "Tipo",
      "FC"
    ];

    // Converter grupos em linhas do Excel
    gruposPorProdutoData.forEach((grupo) => {
      // Calcular Fator de Conversão (FC = Peso Bruto / Peso Líquido)
      const fatorConversao = grupo.pesoLiquido > 0 ? grupo.pesoBruto / grupo.pesoLiquido : 0;

      excelData.push([
        grupo.produto,       // Produto
        grupo.produto,       // Produto Pai (mesmo nome já que agrupamos por produto pai)
        grupo.data,          // Data
        grupo.responsavel,   // Responsável
        grupo.quantidade,    // Quantidade (soma do dia)
        grupo.pesoBruto,     // Peso Bruto (soma do dia)
        grupo.pesoLiquido,   // Peso Líquido (soma do dia)
        "Produto",           // Tipo
        Number(fatorConversao.toFixed(2)) // FC (calculado da soma)
      ]);
    });

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Criar worksheet com headers e dados
    const wsData = [headers, ...excelData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Configurar larguras das colunas conforme layout FC
    ws['!cols'] = [
      { wch: 20 }, // Produto
      { wch: 20 }, // Produto Pai
      { wch: 12 }, // Data
      { wch: 15 }, // Responsável
      { wch: 10 }, // Quantidade
      { wch: 10 }, // Peso Bruto
      { wch: 10 }, // Peso Líquido
      { wch: 10 }, // Tipo
      { wch: 8 }   // FC
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

        // Formatação específica por coluna
        if (C === 4) { // Quantidade - sem casas decimais
          ws[cellAddress].t = "n";
          ws[cellAddress].z = "0";
          ws[cellAddress].s.alignment = { horizontal: "right" };
        } else if (C === 5 || C === 6) { // Peso Bruto e Líquido - 3 casas decimais
          ws[cellAddress].t = "n";
          ws[cellAddress].z = "0.000";
          ws[cellAddress].s.alignment = { horizontal: "right" };
        } else if (C === 8) { // FC - 2 casas decimais
          ws[cellAddress].t = "n";
          ws[cellAddress].z = "0.00";
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
    XLSX.utils.book_append_sheet(wb, ws, "Fator de Conversão");

    // Gerar buffer
    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=relatorio_fator_conversao.xlsx",
      },
    });

  } catch (error: any) {
    console.error("Erro ao gerar Excel FC:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao gerar Excel" },
      { status: 500 }
    );
  }
}