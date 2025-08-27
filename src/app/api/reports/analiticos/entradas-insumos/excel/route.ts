import { createClient } from "@/utils/supabase";
import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Tipos baseados na estrutura de entrada de insumos
type Recebimento = {
  id: string;
  created_at: string;
  data_recebimento: string;
  peso_bruto: number;
  fornecedor: string;
  nota_fiscal: string;
  sif: string;
  temperatura: string;
  lote: string;
  validade: string;
  conformidade_transporte: string;
  conformidade_embalagem: string;
  conformidade_produtos: string;
  observacoes: string;
  produto_id?: string;
  operador_id?: string;
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

    console.log("Filtros recebidos para Entradas:", { from: dateRange.from, to: dateRange.to });

    // Buscar recebimentos no período especificado
    const { data: recebimentos, error } = await supabase
      .from("recebimentos")
      .select(`
        *,
        produtos!entrada_insumos_produto_id_fkey (
          nome
        ),
        operadores (
          nome
        )
      `)
      .gte("data_recebimento", dateRange.from)
      .lte("data_recebimento", dateRange.to)
      .order("data_recebimento", { ascending: false });

    if (error) {
      console.error("Erro na consulta Entradas:", error);
      throw error;
    }
    
    console.log("Entradas encontradas:", recebimentos?.length || 0);

    // Se não há dados, retornar arquivo vazio com mensagem
    if (!recebimentos || recebimentos.length === 0) {
      const emptyData = [
        ["Data", "Produto", "Peso Bruto", "Fornecedor", "NF", "SIF", "Temperatura", "Lote", "Validade", "Responsável", "Conf. Transporte", "Conf. Embalagem", "Conf. Produtos", "Observações"],
        ["Nenhuma entrada encontrada no período selecionado", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["Dica: Verifique se existem dados de entrada", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["no período selecionado ou se você tem", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["permissão para visualizar estes dados.", "", "", "", "", "", "", "", "", "", "", "", "", ""]
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(emptyData);
      
      ws['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, 
        { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 20 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, "Entradas de Insumos");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=relatorio_entradas_vazio.xlsx",
        },
      });
    }

    // Preparar dados para o Excel com todos os campos das entradas
    const excelData: any[] = [];

    // Headers baseados nos campos do formulário de entrada
    const headers = [
      "Data Recebimento",
      "Produto",
      "Peso Bruto", 
      "Fornecedor",
      "Nota Fiscal",
      "SIF",
      "Temperatura °C",
      "Lote",
      "Validade",
      "Responsável",
      "Conf. Transporte",
      "Conf. Embalagem", 
      "Conf. Produtos",
      "Observações"
    ];

    // Processar cada recebimento
    (recebimentos as unknown as Recebimento[]).forEach((recebimento) => {
      const dataRecebimento = new Date(recebimento.data_recebimento).toLocaleDateString('pt-BR');
      const dataValidade = recebimento.validade ? new Date(recebimento.validade).toLocaleDateString('pt-BR') : "";
      const produto = recebimento.produtos?.nome || "Produto não identificado";
      const operador = recebimento.operadores?.nome || "Não informado";
      
      // Converter conformidades para texto legível
      const conformidadeTransporte = recebimento.conformidade_transporte === 'C' ? 'Conforme' : 
                                   recebimento.conformidade_transporte === 'N' ? 'Não Conforme' : 
                                   recebimento.conformidade_transporte || '';
                                   
      const conformidadeEmbalagem = recebimento.conformidade_embalagem === 'C' ? 'Conforme' : 
                                  recebimento.conformidade_embalagem === 'N' ? 'Não Conforme' : 
                                  recebimento.conformidade_embalagem || '';
                                  
      const conformidadeProdutos = recebimento.conformidade_produtos === 'C' ? 'Conforme' : 
                                 recebimento.conformidade_produtos === 'N' ? 'Não Conforme' : 
                                 recebimento.conformidade_produtos || '';

      excelData.push([
        dataRecebimento,                              // Data Recebimento
        produto,                                      // Produto
        Number(recebimento.peso_bruto) || 0,         // Peso Bruto
        recebimento.fornecedor || "",                // Fornecedor
        recebimento.nota_fiscal || "",               // Nota Fiscal
        recebimento.sif || "",                       // SIF
        recebimento.temperatura || "",               // Temperatura
        recebimento.lote || "",                      // Lote
        dataValidade,                                // Validade
        operador,                                    // Responsável
        conformidadeTransporte,                      // Conf. Transporte
        conformidadeEmbalagem,                       // Conf. Embalagem
        conformidadeProdutos,                        // Conf. Produtos
        recebimento.observacoes || ""                // Observações
      ]);
    });

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Criar worksheet com headers e dados
    const wsData = [headers, ...excelData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Configurar larguras das colunas
    ws['!cols'] = [
      { wch: 12 }, // Data Recebimento
      { wch: 25 }, // Produto
      { wch: 10 }, // Peso Bruto
      { wch: 20 }, // Fornecedor
      { wch: 15 }, // Nota Fiscal
      { wch: 15 }, // SIF
      { wch: 12 }, // Temperatura
      { wch: 15 }, // Lote
      { wch: 12 }, // Validade
      { wch: 20 }, // Responsável
      { wch: 15 }, // Conf. Transporte
      { wch: 15 }, // Conf. Embalagem
      { wch: 15 }, // Conf. Produtos
      { wch: 30 }  // Observações
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
        if (C === 2) { // Peso Bruto - 3 casas decimais
          ws[cellAddress].t = "n";
          ws[cellAddress].z = "0.000";
          ws[cellAddress].s.alignment = { horizontal: "right" };
        } else if (C === 0 || C === 8) { // Datas - formato de data
          ws[cellAddress].s.alignment = { horizontal: "center" };
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
    XLSX.utils.book_append_sheet(wb, ws, "Entradas de Insumos");

    // Gerar buffer
    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=relatorio_entradas_insumos.xlsx",
      },
    });

  } catch (error: any) {
    console.error("Erro ao gerar Excel Entradas:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao gerar Excel" },
      { status: 500 }
    );
  }
}