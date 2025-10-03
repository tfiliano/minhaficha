import { createClient } from "@/utils/supabase";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const supabase = await createClient();

    console.log("Buscando produtos com item_de_cardapio = true...");

    // Buscar produtos que são itens de cardápio
    const { data: produtos, error } = await supabase
      .from("produtos")
      .select(`
        codigo,
        nome,
        preco_venda,
        custo_unitario,
        grupos (
          nome
        )
      `)
      .eq("item_de_cardapio", true)
      .eq("ativo", true)
      .order("grupos(nome)", { ascending: true });

    if (error) {
      console.error("Erro na consulta:", error);
      throw error;
    }

    console.log("Produtos encontrados:", produtos?.length || 0);

    // Se não há dados
    if (!produtos || produtos.length === 0) {
      const emptyData = [
        ["Grupo", "Código", "Descrição", "Preço de Venda", "Preço de Custo", "Margem de Contribuição"],
        ["Nenhum item de cardápio encontrado", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["Dica: Verifique se existem produtos marcados como", "", "", "", "", ""],
        ["'item de cardápio' no cadastro de produtos.", "", "", "", "", ""]
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(emptyData);

      ws['!cols'] = [
        { wch: 25 }, { wch: 15 }, { wch: 40 },
        { wch: 18 }, { wch: 18 }, { wch: 25 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Margem de Contribuição");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=relatorio_margem_vazio.xlsx",
        },
      });
    }

    // Preparar dados para o Excel agrupado por grupo
    const excelData: any[] = [];

    // Headers
    const headers = [
      "Grupo",
      "Código",
      "Descrição",
      "Preço de Venda",
      "Preço de Custo",
      "Margem de Contribuição"
    ];

    // Agrupar produtos por grupo
    const produtosPorGrupo: { [key: string]: any[] } = {};

    produtos.forEach((produto: any) => {
      const nomeGrupo = produto.grupos?.nome || "Sem Grupo";

      if (!produtosPorGrupo[nomeGrupo]) {
        produtosPorGrupo[nomeGrupo] = [];
      }

      produtosPorGrupo[nomeGrupo].push(produto);
    });

    // Processar cada grupo
    Object.keys(produtosPorGrupo).sort().forEach((nomeGrupo) => {
      const produtosDoGrupo = produtosPorGrupo[nomeGrupo];

      produtosDoGrupo.forEach((produto: any, index: number) => {
        const precoVenda = Number(produto.preco_venda) || 0;
        const precoCusto = Number(produto.custo_unitario) || 0;

        // Calcular margem
        let margem: number | string = 0;
        if (precoCusto > 0 && precoVenda > 0) {
          margem = precoVenda / precoCusto;
        } else if (precoVenda === 0 && precoCusto === 0) {
          margem = "N/A";
        } else {
          margem = 0;
        }

        excelData.push([
          index === 0 ? nomeGrupo : "", // Mostrar nome do grupo apenas na primeira linha
          produto.codigo || "",
          produto.nome || "",
          precoVenda,
          precoCusto,
          margem
        ]);
      });
    });

    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Criar worksheet com headers e dados
    const wsData = [headers, ...excelData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Configurar larguras das colunas
    ws['!cols'] = [
      { wch: 25 }, // Grupo
      { wch: 15 }, // Código
      { wch: 40 }, // Descrição
      { wch: 18 }, // Preço de Venda
      { wch: 18 }, // Preço de Custo
      { wch: 25 }  // Margem de Contribuição
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
        if (C === 3 || C === 4) { // Preço de Venda e Custo - formato R$
          ws[cellAddress].t = "n";
          ws[cellAddress].z = "R$ #,##0.00";
          ws[cellAddress].s.alignment = { horizontal: "right" };
        } else if (C === 5) { // Margem - formato numérico com 1 decimal
          if (ws[cellAddress].v !== "N/A") {
            ws[cellAddress].t = "n";
            ws[cellAddress].z = "0.0"; // Formato numérico com 1 decimal
            ws[cellAddress].s.alignment = { horizontal: "right" };
          } else {
            ws[cellAddress].s.alignment = { horizontal: "center" };
          }
        } else {
          // Texto alinhado à esquerda
          ws[cellAddress].s.alignment = { horizontal: "left" };
        }

        // Grupo em negrito
        if (C === 0 && ws[cellAddress].v) {
          ws[cellAddress].s.font = { bold: true };
        }

        // Cores alternadas nas linhas
        if (R % 2 === 0) {
          ws[cellAddress].s.fill = { fgColor: { rgb: "F8F9FA" } };
        }
      }
    }

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Margem de Contribuição");

    // Gerar buffer
    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=relatorio_margem_contribuicao.xlsx",
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
