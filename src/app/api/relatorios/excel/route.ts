import { createClient } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import {
  getDadosProducao,
  getDadosConversao,
  getDadosInsumos,
  getDadosMargem,
} from "@/app/(admin)/admin/relatorios/actions";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supabase = await createClient();

    // Buscar dados da loja
    const lojaId = request.cookies.get("minhaficha_loja_id")?.value;

    let nomeLoja = "Minha Ficha";
    if (lojaId) {
      const { data: loja } = await supabase
        .from("lojas")
        .select("nome")
        .eq("id", lojaId)
        .single();

      if (loja) {
        nomeLoja = loja.nome;
      }
    }

    // Extrair filtros dos query params
    const filtros = {
      dataInicio: searchParams.get("dataInicio") || undefined,
      dataFim: searchParams.get("dataFim") || undefined,
      grupo: searchParams.get("grupo") || undefined,
      produtoPai: searchParams.get("produtoPai") || undefined,
      armazenamento: searchParams.get("armazenamento") || undefined,
      setor: searchParams.get("setor") || undefined,
      itemCardapio: searchParams.get("itemCardapio") || undefined,
    };

    const tipoRelatorio = searchParams.get("tipo") || "producao";

    // Buscar dados do relatório selecionado
    let dados: any[] = [];
    let tituloRelatorio = "";

    switch (tipoRelatorio) {
      case "producao":
        dados = await getDadosProducao(filtros);
        tituloRelatorio = "Relatório de Produção";
        break;
      case "conversao":
        dados = await getDadosConversao(filtros);
        tituloRelatorio = "Relatório de Conversão";
        break;
      case "insumos":
        dados = await getDadosInsumos(filtros);
        tituloRelatorio = "Relatório de Insumos";
        break;
      case "margem":
        dados = await getDadosMargem(filtros);
        tituloRelatorio = "Relatório de Margem de Contribuição";
        break;
    }

    // Criar workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(tituloRelatorio);

    // Definir colunas baseado no tipo de relatório
    let columns: any[] = [];

    switch (tipoRelatorio) {
      case "producao":
        columns = [
          { header: "Código", key: "codigo", width: 12 },
          { header: "Produto", key: "produto", width: 30 },
          { header: "Produto Pai", key: "produtoPai", width: 30 },
          { header: "Data", key: "data", width: 12 },
          { header: "Responsável", key: "responsavel", width: 25 },
          { header: "Quantidade", key: "quantidade", width: 12 },
          { header: "Peso (kg)", key: "peso", width: 12 },
          { header: "Tipo", key: "tipo", width: 15 },
          { header: "Peso Médio (kg)", key: "pesoMedio", width: 15 },
        ];
        break;

      case "conversao":
        columns = [
          { header: "Produto", key: "produto", width: 30 },
          { header: "Produto Pai", key: "produtoPai", width: 30 },
          { header: "Data", key: "data", width: 12 },
          { header: "Responsável", key: "responsavel", width: 25 },
          { header: "Quantidade", key: "quantidade", width: 12 },
          { header: "Peso Bruto (kg)", key: "pesoBruto", width: 15 },
          { header: "Peso Líquido (kg)", key: "pesoLiquido", width: 15 },
          { header: "Tipo", key: "tipo", width: 15 },
          { header: "FC", key: "fc", width: 10 },
        ];
        break;

      case "insumos":
        columns = [
          { header: "Data", key: "dataRecebimento", width: 12 },
          { header: "Produto", key: "produto", width: 30 },
          { header: "Peso Bruto (kg)", key: "pesoBruto", width: 15 },
          { header: "Fornecedor", key: "fornecedor", width: 25 },
          { header: "NF", key: "notaFiscal", width: 15 },
          { header: "SIF", key: "sif", width: 12 },
          { header: "Temperatura", key: "temperatura", width: 12 },
          { header: "Lote", key: "lote", width: 15 },
          { header: "Validade", key: "validade", width: 12 },
          { header: "Responsável", key: "responsavel", width: 25 },
          { header: "Observações", key: "observacoes", width: 40 },
        ];
        break;

      case "margem":
        columns = [
          { header: "Grupo", key: "grupo", width: 20 },
          { header: "Código", key: "codigo", width: 12 },
          { header: "Descrição", key: "descricao", width: 35 },
          { header: "Preço de Venda", key: "precoVenda", width: 15 },
          { header: "Preço de Custo", key: "precoCusto", width: 15 },
          { header: "Margem (%)", key: "margem", width: 12 },
        ];
        break;
    }

    worksheet.columns = columns;

    // Estilizar header
    worksheet.getRow(1).font = { bold: true, size: 11 };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(1).height = 25;

    // Adicionar dados
    dados.forEach((item) => {
      const row: any = {};

      switch (tipoRelatorio) {
        case "producao":
          row.codigo = item.codigo || "-";
          row.produto = item.produto || "-";
          row.produtoPai = item.produtoPai || "-";
          row.data = item.data || "-";
          row.responsavel = item.responsavel || "-";
          row.quantidade = item.quantidade || 0;
          row.peso = item.peso || 0;
          row.tipo = item.tipo || "-";
          row.pesoMedio = item.pesoMedio || 0;
          break;

        case "conversao":
          row.produto = item.produto || "-";
          row.produtoPai = item.produtoPai || "-";
          row.data = item.data || "-";
          row.responsavel = item.responsavel || "-";
          row.quantidade = item.quantidade || 0;
          row.pesoBruto = item.pesoBruto || 0;
          row.pesoLiquido = item.pesoLiquido || 0;
          row.tipo = item.tipo || "-";
          row.fc = item.fc || 0;
          break;

        case "insumos":
          row.dataRecebimento = item.dataRecebimento || "-";
          row.produto = item.produto || "-";
          row.pesoBruto = item.pesoBruto || 0;
          row.fornecedor = item.fornecedor || "-";
          row.notaFiscal = item.notaFiscal || "-";
          row.sif = item.sif || "-";
          row.temperatura = item.temperatura || "-";
          row.lote = item.lote || "-";
          row.validade = item.validade || "-";
          row.responsavel = item.responsavel || "-";
          row.observacoes = item.observacoes || "-";
          break;

        case "margem":
          row.grupo = item.grupo || "-";
          row.codigo = item.codigo || "-";
          row.descricao = item.descricao || "-";
          row.precoVenda = item.precoVenda || 0;
          row.precoCusto = item.precoCusto || 0;
          row.margem = item.margem || 0;
          break;
      }

      worksheet.addRow(row);
    });

    // Formatar números
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell, colNumber) => {
          // Alinhar células
          if (typeof cell.value === "number") {
            cell.alignment = { horizontal: "right" };
            cell.numFmt = "#,##0.00";
          } else {
            cell.alignment = { horizontal: "left" };
          }
        });
      }
    });

    // Adicionar bordas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Gerar buffer do Excel
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `relatorio-${tipoRelatorio}-${format(new Date(), "yyyyMMdd-HHmmss")}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar Excel:", error);
    return NextResponse.json(
      { error: "Erro ao gerar Excel" },
      { status: 500 }
    );
  }
}
