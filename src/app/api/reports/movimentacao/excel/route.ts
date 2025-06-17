import { createClient } from "@/utils/supabase";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

type Produto = {
  id: string;
  nome: string;
  unidade: string | null;
};

type Recebimento = {
  produto_id: string;
  peso_bruto: number | null;
};

type Producao = {
  produto_id: string;
  peso_liquido: number | null;
};

export async function POST(request: Request) {
  try {
    const { items, dateRange } = await request.json();

    const supabase = await createClient();

    // Produtos
    let produtosQuery = supabase
      .from("produtos")
      .select("id, nome, unidade")
      .gte("created_at", dateRange.from)
      .lte("created_at", dateRange.to);

    if (items?.length > 0) {
      produtosQuery = produtosQuery.in("id", items);
    }

    const { data: produtos, error: erroProdutos } = await produtosQuery;
    if (erroProdutos) throw erroProdutos;

    const produtoIds = produtos.map((p: Produto) => p.id);

    // Recebimentos
    let recebQuery = supabase
      .from("recebimentos")
      .select("produto_id, peso_bruto")
      .gte("created_at", dateRange.from)
      .lte("created_at", dateRange.to);

    if (produtoIds.length > 0) {
      recebQuery = recebQuery.in("produto_id", produtoIds);
    }

    const { data: recebimentos, error: erroReceb } = await recebQuery;
    if (erroReceb) throw erroReceb;

    // Produções
    let prodQuery = supabase
      .from("producoes")
      .select("produto_id, peso_liquido")
      .gte("created_at", dateRange.from)
      .lte("created_at", dateRange.to);

    if (produtoIds.length > 0) {
      prodQuery = prodQuery.in("produto_id", produtoIds);
    }

    const { data: producoes, error: erroProd } = await prodQuery;
    if (erroProd) throw erroProd;

    // Agregação
    const mapa: Record<
      string,
      {
        nome: string;
        unidade: string;
        entradas: number;
        saidas: number;
        estoque: number;
        acerto: number;
      }
    > = {};

    for (const produto of produtos as Produto[]) {
      mapa[produto.id] = {
        nome: produto.nome,
        unidade: produto.unidade || "-",
        entradas: 0,
        saidas: 0,
        estoque: 0, // inicial
        acerto: 0, // por enquanto estático
      };
    }

    for (const r of recebimentos as Recebimento[]) {
      if (r.produto_id && mapa[r.produto_id]) {
        mapa[r.produto_id].entradas += Number(r.peso_bruto || 0);
      }
    }

    for (const p of producoes as Producao[]) {
      if (p.produto_id && mapa[p.produto_id]) {
        mapa[p.produto_id].saidas += Number(p.peso_liquido || 0);
      }
    }

    // Montagem dos dados
    const excelData = Object.values(mapa).map((item) => {
      const saldo = item.estoque + item.entradas - item.saidas;
      const diferenca = item.acerto ? saldo - item.acerto : null;

      return {
        Produto: item.nome,
        Unidade: item.unidade,
        Estoque: Number(item.estoque.toFixed(2)),
        Entradas: Number(item.entradas.toFixed(2)),
        Saídas: Number(item.saidas.toFixed(2)),
        Saldo: Number(saldo.toFixed(2)),
        Acerto: Number(item.acerto.toFixed(2)),
        Diferença: diferenca !== null ? Number(diferenca.toFixed(2)) : "-",
      };
    });

    // Geração do Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws["!cols"] = [
      { wch: 30 }, // Produto
      { wch: 10 }, // Unidade
      { wch: 12 }, // Estoque
      { wch: 12 }, // Entradas
      { wch: 12 }, // Saídas
      { wch: 12 }, // Saldo
      { wch: 12 }, // Acerto
      { wch: 12 }, // Diferença
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Movimentação");

    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=movimentacao_produtos.xlsx",
      },
    });
  } catch (error: any) {
    console.error("Erro ao gerar Excel:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao gerar planilha" },
      { status: 500 }
    );
  }
}
