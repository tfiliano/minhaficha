import * as XLSX from "xlsx";

import { createClient } from "@/utils/supabase";
import { NextResponse } from "next/server";

async function fetchProdutos() {
  const supabase = await createClient();

  // Buscar produtos com suas relações
  const { data: produtos, error: produtosError } = await supabase
    .from("produtos")
    .select(`
      id,
      codigo,
      grupo,
      setor,
      estoque_unidade,
      estoque_kilo,
      armazenamento,
      dias_validade,
      nome,
      unidade,
      ativo,
      originado,
      grupos(nome),
      locais_armazenamento(armazenamento)
    `)
    .order('nome', { ascending: true });

  if (produtosError) {
    console.error("Erro ao buscar produtos:", produtosError);
    throw new Error("Erro ao buscar produtos: " + produtosError.message);
  }

  if (!produtos || produtos.length === 0) {
    console.log("Nenhum produto encontrado");
    return [];
  }

  // Buscar todos os produtos pai de uma vez para melhor performance
  const produtosOriginadosIds = produtos
    .map(p => p.originado)
    .filter(id => id != null);

  let produtosPaiMap = new Map();

  if (produtosOriginadosIds.length > 0) {
    const { data: produtosPai } = await supabase
      .from("produtos")
      .select("id, nome")
      .in('id', produtosOriginadosIds);

    if (produtosPai) {
      produtosPai.forEach(p => produtosPaiMap.set(p.id, p));
    }
  }

  // Enriquecer os dados com o produto pai
  const produtosEnriquecidos = produtos.map(produto => ({
    ...produto,
    produto_pai: produto.originado ? produtosPaiMap.get(produto.originado) : null
  }));

  return produtosEnriquecidos;
}

async function generateExcel2(data: any) {
  // Mapeia os dados para o formato exato de importação
  // Seguindo o padrão definido em preview-import-action.ts
  const formattedData = data.map((item: any) => ({
    "Nome do Produto": item["nome"] || "",
    "Código": item["codigo"] || "",
    "Unidade": item["unidade"] || "UN",
    "Setor": item["setor"] || "AÇOUGUE",
    "Nome do Grupo": item["grupos"]?.nome || "",
    "Nome do Armazenamento": item["locais_armazenamento"]?.armazenamento || "",
    "Nome do Produto Pai": item["produto_pai"]?.nome || "",
    "Estoque Unidade": item["estoque_unidade"] || "",
    "Estoque Kilo": item["estoque_kilo"] || "",
    "Dias Validade": item["dias_validade"] || "",
    "Ativo": item["ativo"] ? "SIM" : "NÃO",
  }));

  // Converte os dados formatados para uma planilha
  const ws = XLSX.utils.json_to_sheet(formattedData);

  // Define a largura das colunas para melhor visualização
  const colWidths = [
    { wch: 30 }, // Nome do Produto
    { wch: 15 }, // Código
    { wch: 10 }, // Unidade
    { wch: 15 }, // Setor
    { wch: 20 }, // Nome do Grupo
    { wch: 20 }, // Nome do Armazenamento
    { wch: 25 }, // Nome do Produto Pai
    { wch: 15 }, // Estoque Unidade
    { wch: 15 }, // Estoque Kilo
    { wch: 15 }, // Dias Validade
    { wch: 10 }, // Ativo
  ];
  ws['!cols'] = colWidths;

  // Cria um novo workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produtos");

  // Gera o arquivo Excel em formato binário
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  return buffer;
}

export async function GET() {
  try {
    console.log("Iniciando geração de Excel...");
    const produtos = await fetchProdutos();
    console.log(`Produtos carregados: ${produtos.length}`);

    const buffer = await generateExcel2(produtos);
    console.log("Excel gerado com sucesso");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=produtos.xlsx",
      },
    });
  } catch (error: any) {
    console.error("Erro na geração do Excel:", error);
    return new NextResponse(
      JSON.stringify({
        error: error?.message || "Erro ao gerar Excel",
        details: error?.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
