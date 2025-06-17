import { createClient } from "@/utils/supabase";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

type Producao = {
  produto?: { nome: string };
  peso_bruto: number;
  peso_liquido: number;
};

export async function POST(request: Request) {
  try {
    const { items, dateRange } = await request.json();

    const supabase = await createClient();

    let query = supabase
      .from("producoes")
      .select(
        `
        peso_bruto,
        peso_liquido,
        produto:produtos ( nome )
      `
      )
      .gte("created_at", dateRange.from)
      .lte("created_at", dateRange.to);

    if (items && items.length > 0) {
      query = query.in("produto_id", items);
    }

    const { data: producoes, error } = await query;

    if (error) throw error;

    const agregados: Record<string, { bruto: number; liquido: number }> = {};

    // Agrupamento por produto
    for (const producao of producoes as Producao[]) {
      const nome = producao.produto?.nome || "Sem Nome";

      if (!agregados[nome]) {
        agregados[nome] = { bruto: 0, liquido: 0 };
      }

      agregados[nome].bruto += producao.peso_bruto || 0;
      agregados[nome].liquido += producao.peso_liquido || 0;
    }

    // Monta dados para planilha
    const excelData = Object.entries(agregados).map(([nome, dados]) => {
      const perda = dados.bruto - dados.liquido;
      const fator = dados.liquido > 0 ? dados.bruto / dados.liquido : 0;

      return {
        Produto: nome,
        Bruto: Number(dados.bruto.toFixed(1)),
        Liquido: Number(dados.liquido.toFixed(1)),
        Perda: Number(perda.toFixed(1)),
        FC: Number(fator.toFixed(2)),
      };
    });

    // Gera planilha
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws["!cols"] = [
      { wch: 30 }, // Produto
      { wch: 12 }, // Bruto
      { wch: 12 }, // Líquido
      { wch: 12 }, // Perda
      { wch: 8 }, // FC
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Fator de Correção");

    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=fator_correcao.xlsx",
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
