import { createClient } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import {
  getDadosProducao,
  getDadosConversao,
  getDadosInsumos,
  getDadosMargem,
} from "@/app/(admin)/admin/relatorios/actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Configurações para Vercel
export const maxDuration = 60; // 60 segundos
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supabase = await createClient();

    // Buscar dados da loja
    const { data: { user } } = await supabase.auth.getUser();
    const lojaId = request.cookies.get("minhaficha_loja_id")?.value;

    let nomeLoja = "Minha Ficha";
    if (lojaId) {
      const { data: loja } = await supabase
        .from("lojas")
        .select("nome, cnpj, endereco")
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

    // Gerar HTML para o PDF
    const html = generatePDFHTML({
      nomeLoja,
      tituloRelatorio,
      dados,
      tipo: tipoRelatorio,
      filtros,
    });

    // Gerar PDF com Puppeteer
    const isProduction = process.env.VERCEL || process.env.NODE_ENV === "production";

    const browser = await puppeteerCore.launch({
      args: isProduction
        ? chromium.args
        : ["--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chromium.defaultViewport,
      executablePath: isProduction
        ? await chromium.executablePath()
        : process.env.PUPPETEER_EXECUTABLE_PATH ||
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "10mm",
        bottom: "20mm",
        left: "10mm",
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 8px; width: 100%; padding: 0 10mm; display: flex; justify-content: space-between; align-items: center; color: #64748b;">
          <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
          <span style="text-align: center; flex: 1;">Gerado com https://minhaficha.app</span>
          <span>Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
        </div>
      `,
    });

    await browser.close();

    // Retornar PDF
    const fileName = `relatorio-${tipoRelatorio}-${format(new Date(), "yyyyMMdd-HHmmss")}.pdf`;

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json(
      {
        error: "Erro ao gerar PDF",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

function generatePDFHTML({
  nomeLoja,
  tituloRelatorio,
  dados,
  tipo,
  filtros,
}: {
  nomeLoja: string;
  tituloRelatorio: string;
  dados: any[];
  tipo: string;
  filtros: any;
}) {
  // Gerar descrição dos filtros aplicados
  const filtrosAplicados: string[] = [];
  if (filtros.dataInicio && filtros.dataFim) {
    const inicio = format(new Date(filtros.dataInicio), "dd/MM/yyyy", { locale: ptBR });
    const fim = format(new Date(filtros.dataFim), "dd/MM/yyyy", { locale: ptBR });
    filtrosAplicados.push(`Período: ${inicio} a ${fim}`);
  }
  if (filtros.grupo) filtrosAplicados.push(`Grupo filtrado`);
  if (filtros.produtoPai) filtrosAplicados.push(`Produto Pai filtrado`);
  if (filtros.armazenamento) filtrosAplicados.push(`Armazenamento filtrado`);
  if (filtros.setor) filtrosAplicados.push(`Setor filtrado`);
  if (filtros.itemCardapio === "true") filtrosAplicados.push(`Apenas itens de cardápio`);

  const filtrosTexto = filtrosAplicados.length > 0
    ? filtrosAplicados.join(" • ")
    : "Sem filtros aplicados";

  // Gerar linhas da tabela baseado no tipo de relatório
  let colunas: string[] = [];
  let linhas: string = "";

  switch (tipo) {
    case "producao":
      colunas = ["Código", "Produto", "Produto Pai", "Data", "Responsável", "Quantidade", "Peso", "Tipo", "Peso Médio"];
      linhas = dados.map(item => `
        <tr>
          <td class="text-center">${item.codigo || '-'}</td>
          <td>${item.produto || '-'}</td>
          <td>${item.produtoPai || '-'}</td>
          <td class="text-center">${format(new Date(item.data), "dd/MM/yyyy", { locale: ptBR })}</td>
          <td>${item.responsavel || '-'}</td>
          <td class="text-right">${item.quantidade?.toFixed(0) || '0'}</td>
          <td class="text-right">${item.peso?.toFixed(2) || '0.00'} kg</td>
          <td class="text-center"><span class="badge">${item.tipo || '-'}</span></td>
          <td class="text-right">${item.pesoMedio?.toFixed(3) || '0.000'} kg</td>
        </tr>
      `).join("");
      break;

    case "conversao":
      colunas = ["Produto", "Produto Pai", "Data", "Responsável", "Quantidade", "Peso Bruto", "Peso Líquido", "Tipo", "FC"];
      linhas = dados.map(item => `
        <tr>
          <td>${item.produto || '-'}</td>
          <td>${item.produtoPai || '-'}</td>
          <td class="text-center">${format(new Date(item.data), "dd/MM/yyyy", { locale: ptBR })}</td>
          <td>${item.responsavel || '-'}</td>
          <td class="text-right">${item.quantidade?.toFixed(0) || '0'}</td>
          <td class="text-right">${item.pesoBruto?.toFixed(3) || '0.000'} kg</td>
          <td class="text-right">${item.pesoLiquido?.toFixed(3) || '0.000'} kg</td>
          <td class="text-center"><span class="badge">${item.tipo || '-'}</span></td>
          <td class="text-right text-blue">${item.fc?.toFixed(2) || '0.00'}</td>
        </tr>
      `).join("");
      break;

    case "insumos":
      colunas = ["Data", "Produto", "Peso Bruto", "Fornecedor", "NF", "SIF", "Temp.", "Lote", "Validade", "Responsável", "Observações"];
      linhas = dados.map(item => `
        <tr>
          <td class="text-center">${item.dataRecebimento || '-'}</td>
          <td>${item.produto || '-'}</td>
          <td class="text-right">${item.pesoBruto?.toFixed(3) || '0.000'} kg</td>
          <td>${item.fornecedor || '-'}</td>
          <td class="text-center">${item.notaFiscal || '-'}</td>
          <td class="text-center">${item.sif || '-'}</td>
          <td class="text-center">${item.temperatura || '-'}°C</td>
          <td>${item.lote || '-'}</td>
          <td class="text-center">${item.validade || '-'}</td>
          <td>${item.responsavel || '-'}</td>
          <td class="text-sm">${item.observacoes || '-'}</td>
        </tr>
      `).join("");
      break;

    case "margem":
      colunas = ["Grupo", "Código", "Descrição", "Preço de Venda", "Preço de Custo", "Margem de Contribuição"];
      linhas = dados.map(item => `
        <tr>
          <td class="font-semibold text-blue">${item.grupo || '-'}</td>
          <td class="text-center">${item.codigo || '-'}</td>
          <td>${item.descricao || '-'}</td>
          <td class="text-right">R$ ${item.precoVenda?.toFixed(2) || '0.00'}</td>
          <td class="text-right">R$ ${item.precoCusto?.toFixed(2) || '0.00'}</td>
          <td class="text-right ${item.margem >= 30 ? 'text-green' : item.margem >= 15 ? 'text-orange' : 'text-red'}">
            ${item.margem?.toFixed(2) || '0.00'}%
          </td>
        </tr>
      `).join("");
      break;
  }

  const colunasHTML = colunas.map(col => `<th>${col}</th>`).join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            font-size: 9px;
            line-height: 1.4;
            color: #1e293b;
            background: #ffffff;
          }

          .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 0 4px;
          }

          /* Cabeçalho */
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 16px 20px;
            margin-bottom: 16px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          }

          .header h1 {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .header-subtitle {
            font-size: 11px;
            opacity: 0.95;
            font-weight: 500;
          }

          .header-loja {
            text-align: right;
          }

          .header-loja-name {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 2px;
          }

          .header-loja-date {
            font-size: 9px;
            opacity: 0.85;
          }

          /* Filtros aplicados */
          .filtros-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 12px;
          }

          .filtros-label {
            font-size: 8px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .filtros-texto {
            font-size: 10px;
            color: #475569;
            font-weight: 500;
          }

          /* Tabela */
          .table-wrapper {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
          }

          thead {
            background: #f8fafc;
          }

          th {
            padding: 8px 6px;
            text-align: left;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-size: 8px;
            border-bottom: 2px solid #e2e8f0;
          }

          tbody tr {
            border-bottom: 1px solid #f1f5f9;
          }

          tbody tr:last-child {
            border-bottom: none;
          }

          tbody tr:nth-child(even) {
            background: #fafbfc;
          }

          td {
            padding: 7px 6px;
            color: #334155;
          }

          .text-right {
            text-align: right;
          }

          .text-center {
            text-align: center;
          }

          .text-green {
            color: #059669;
            font-weight: 600;
          }

          .text-orange {
            color: #f59e0b;
            font-weight: 600;
          }

          .text-red {
            color: #dc2626;
            font-weight: 600;
          }

          .text-blue {
            color: #2563eb;
            font-weight: 600;
          }

          .font-semibold {
            font-weight: 600;
          }

          .badge {
            display: inline-block;
            padding: 2px 8px;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 12px;
            font-size: 8px;
            font-weight: 600;
          }

          /* Resumo */
          .resumo {
            margin-top: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 10px;
            color: #475569;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Cabeçalho -->
          <div class="header">
            <div class="header-top">
              <div>
                <h1>${tituloRelatorio}</h1>
                <div class="header-subtitle">Relatório analítico de dados</div>
              </div>
              <div class="header-loja">
                <div class="header-loja-name">${nomeLoja}</div>
                <div class="header-loja-date">${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
              </div>
            </div>
          </div>

          <!-- Filtros Aplicados -->
          <div class="filtros-box">
            <div class="filtros-label">Filtros Aplicados</div>
            <div class="filtros-texto">${filtrosTexto}</div>
          </div>

          <!-- Tabela de Dados -->
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  ${colunasHTML}
                </tr>
              </thead>
              <tbody>
                ${linhas}
              </tbody>
            </table>
          </div>

          <!-- Resumo -->
          <div class="resumo">
            Total de registros: ${dados.length}
          </div>
        </div>
      </body>
    </html>
  `;
}
