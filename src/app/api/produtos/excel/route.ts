"use server";

import * as XLSX from "xlsx";

import { createClient } from "@/utils/supabase";
import { NextResponse } from "next/server";

async function fetchProdutos() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("produtos").select(`
      id, codigo, grupo, setor, estoque_unidade, estoque_kilo, armazenamento, 
      dias_validade, nome, unidade, ativo, 
      produto_pai:produtos!produtos_originado_fkey(nome),
      grupos(nome), 
      locais_armazenamento(armazenamento)
    `);

  if (error) {
    throw new Error("Erro ao buscar produtos: " + error.message);
  }
  return data;
}

async function generateExcel2(data: any) {
  // Personalize os cabeçalhos e a ordem das colunas com base nas chaves dos objetos

  // Mapeia os dados para o novo formato de layout
  const formattedData = data.map((item: any) => ({
    "Nome do Produto": item["nome"],
    "Código": item["codigo"],
    "Unidade": item["unidade"],
    "Setor": item["setor"],
    "Nome do Grupo": item["grupos"]?.nome || item["grupo"] || "",
    "Nome do Armazenamento": item["locais_armazenamento"]?.armazenamento || item["armazenamento"] || "",
    "Nome do Produto Pai": item["produto_pai"]?.nome || "",
    "Estoque Unidade": item["estoque_unidade"],
    "Estoque Kilo": item["estoque_kilo"],
    "Dias Validade": item["dias_validade"],
    "Ativo": item["ativo"] ? "SIM" : "NÃO",
  }));

  // Converte os dados formatados para uma planilha
  const ws = XLSX.utils.json_to_sheet(formattedData);

  // Cria um novo workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produtos");

  // Gera o arquivo Excel em formato binário
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  return buffer;
}

export async function GET() {
  try {
    const produtos = await fetchProdutos();
    const buffer = await generateExcel2(produtos);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=produtos.xlsx",
      },
    });
  } catch (error: any) {
    return new NextResponse(error!.message, { status: 500 });
  }
}
