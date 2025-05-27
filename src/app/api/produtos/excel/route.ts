"use server";

import * as XLSX from "xlsx";

import { createClient } from "@/utils/supabase";
import { NextResponse } from "next/server";

async function fetchProdutos() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("produtos").select(`
      id, codigo, grupo, setor, estoque_unidade, estoque_kilo, armazenamento, 
      dias_validade, originado, nome, unidade, ativo, lojas(nome), grupos(nome,id),armazenamento_id
     
    `);

  if (error) {
    throw new Error("Erro ao buscar produtos: " + error.message);
  }
  return data;
}

async function generateExcel2(data: any) {
  // Personalize os cabeçalhos e a ordem das colunas com base nas chaves dos objetos

  // Mapeia os dados para os títulos das colunas
  const formattedData = data.map((item: any) => ({
    ID: item["id"],
    Código: item["codigo"],
    Grupo: item["grupo"],
    Setor: item["setor"],
    "Estoque Unidade": item["estoque_unidade"],
    "Estoque Kilo": item["estoque_kilo"],
    Armazenamento: item["armazenamento"],
    "Dias Validade": item["dias_validade"],
    "Produto Pai": item["originado"],
    Nome: item["nome"],
    Unidade: item["unidade"],
    Loja: item["lojas"]["nome"],
    Ativo: item["ativo"] ? "SIM" : "NÃO",
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
