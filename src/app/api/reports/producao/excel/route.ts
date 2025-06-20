import { createClient } from "@/utils/supabase";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Tipos explícitos
type ProducaoItem = {
  nome: string;
  peso: number;
  quantidade: number;
  peso_medio: number;
};

type Producao = {
  created_at: string;
  peso_bruto: number;
  peso_liquido: number;
  peso_perda: number;
  fator_correcao: number;
  produto?: { nome: string };
  grupo?: { nome: string };
  items?: ProducaoItem[];
};

type Agrupado = Record<
  string,
  {
    subproduto: string;
    quantidade: number;
    peso: number;
    peso_medio_total: number;
  }[]
>;

export async function POST(request: Request) {
  try {
    const { items, dateRange } = await request.json();

    const supabase = await createClient();

    let query = supabase
      .from("producoes")
      .select(
        `
    *,
    produto:produtos ( id, nome ),
    grupo:grupos ( nome )
  `
      )
      .gte("created_at", dateRange.from)
      .lte("created_at", dateRange.to)
      .order("created_at", { ascending: false });

    if (items && items.length > 0) {
      query = query.in("produto_id", items);
    }

    const { data: producoes, error } = await query;

    if (error) throw error;

    const agrupado: Agrupado = {};

    // Agrupamento por grupo e subproduto
    for (const producao of producoes as unknown as Producao[]) {
      const grupoNome = producao.grupo?.nome || "Sem Grupo";
      const items = producao.items ?? [];

      for (const item of items) {
        agrupado[grupoNome] = agrupado[grupoNome] || [];

        const existente = agrupado[grupoNome].find(
          (i) => i.subproduto === item.nome
        );

        if (existente) {
          existente.quantidade += item.quantidade;
          existente.peso += item.peso;
          existente.peso_medio_total += item.peso_medio;
        } else {
          agrupado[grupoNome].push({
            subproduto: item.nome,
            quantidade: item.quantidade,
            peso: item.peso,
            peso_medio_total: item.peso_medio,
          });
        }
      }
    }

    const excelData: any[] = [];

    let totalQuantidade = 0;
    let totalPeso = 0;
    let totalPesoMedioAcumulado = 0;
    let totalGrupos = 0;

    for (const [grupo, subprodutos] of Object.entries(agrupado)) {
      const grupoQuantidade = subprodutos.reduce(
        (acc, item) => acc + item.quantidade,
        0
      );
      const grupoPeso = subprodutos.reduce((acc, item) => acc + item.peso, 0);
      const grupoPesoMedio =
        subprodutos.reduce((acc, item) => acc + item.peso_medio_total, 0) /
        subprodutos.length;

      // Linha de grupo
      excelData.push({
        Grupo: grupo,
        Subproduto: "",
        Quantidade: grupoQuantidade,
        Peso: grupoPeso.toFixed(3),
        "Peso Médio": grupoPesoMedio.toFixed(3),
      });

      totalQuantidade += grupoQuantidade;
      totalPeso += grupoPeso;
      totalPesoMedioAcumulado += grupoPesoMedio;
      totalGrupos += 1;

      // Linhas dos subprodutos
      for (const item of subprodutos) {
        excelData.push({
          Grupo: "",
          Subproduto: item.subproduto,
          Quantidade: item.quantidade,
          Peso: item.peso.toFixed(3),
          "Peso Médio": item.peso_medio_total.toFixed(3),
        });
      }
    }

    // Total geral
    excelData.push({
      Grupo: "Total Geral",
      Subproduto: "",
      Quantidade: totalQuantidade,
      Peso: totalPeso.toFixed(3),
      "Peso Médio": (totalPesoMedioAcumulado / totalGrupos).toFixed(3),
    });

    // Geração do Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws["!cols"] = [
      { wch: 30 }, // Grupo
      { wch: 40 }, // Subproduto
      { wch: 15 }, // Quantidade
      { wch: 15 }, // Peso
      { wch: 20 }, // Peso Médio
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Resumo Produções");

    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=producoes.xlsx",
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
