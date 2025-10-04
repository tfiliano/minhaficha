import { createClient } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// Configurações para Vercel
export const maxDuration = 60; // 60 segundos
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: produtoId } = await params;
    const supabase = await createClient();

    // Buscar o produto de cardápio
    const { data: produto, error: produtoError } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", produtoId)
      .eq("item_de_cardapio", true)
      .maybeSingle();

    if (produtoError || !produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Buscar a ficha técnica
    const { data: fichaTecnica } = await supabase
      .from("fichas_tecnicas")
      .select("*")
      .eq("produto_cardapio_id", produtoId)
      .maybeSingle();

    if (!fichaTecnica) {
      return NextResponse.json(
        { error: "Ficha técnica não encontrada" },
        { status: 404 }
      );
    }

    // Buscar ingredientes da ficha técnica
    const { data: ingredientes } = await supabase
      .from("fichas_tecnicas_itens")
      .select(`
        *,
        produto:produto_ingrediente_id (
          id,
          codigo,
          nome,
          unidade,
          grupo,
          custo_unitario
        )
      `)
      .eq("ficha_tecnica_id", fichaTecnica.id)
      .order("ordem", { ascending: true });

    // Buscar foto de capa
    const { data: fotos } = await supabase
      .from("fichas_tecnicas_fotos")
      .select("*")
      .eq("ficha_tecnica_id", fichaTecnica.id)
      .order("ordem", { ascending: true });

    const fotoCapa = fotos?.find((f) => f.is_capa)?.url || fotos?.[0]?.url;

    // Função para calcular o custo do ingrediente
    // Fórmula: quantidade × fator_correcao × custo_unitario_produto
    const calcularCustoIngrediente = (item: any): number => {
      const quantidade = item.quantidade || 0;
      const fatorCorrecao = item.fator_correcao || 1.0;
      const custoUnitarioProduto = item.produto?.custo_unitario || 0;
      return quantidade * fatorCorrecao * custoUnitarioProduto;
    };

    // Calcular custos
    const custoTotal = (ingredientes || []).reduce((total, item) => {
      return total + calcularCustoIngrediente(item);
    }, 0);

    const custoPorPorcao = fichaTecnica.porcoes
      ? custoTotal / fichaTecnica.porcoes
      : 0;

    // Gerar HTML para o PDF
    const html = generatePDFHTML({
      produto,
      fichaTecnica,
      ingredientes: ingredientes || [],
      fotoCapa,
      custoTotal,
      custoPorPorcao,
    });

    // Gerar PDF com Puppeteer
    // Detectar ambiente (Vercel/produção vs desenvolvimento)
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
        top: "10mm",
        right: "10mm",
        bottom: "20mm",
        left: "10mm",
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 8px; width: 100%; padding: 0 10mm; display: flex; justify-content: space-between; align-items: center; color: #64748b;">
          <span>Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
          <span style="text-align: center; flex: 1;">Gerado com https://minhaficha.app</span>
          <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
        </div>
      `,
    });

    await browser.close();

    // Retornar PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ficha-tecnica-${produto.codigo}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    );
  }
}

function generatePDFHTML({
  produto,
  fichaTecnica,
  ingredientes,
  fotoCapa,
  custoTotal,
  custoPorPorcao,
}: {
  produto: any;
  fichaTecnica: any;
  ingredientes: any[];
  fotoCapa?: string | null;
  custoTotal: number;
  custoPorPorcao: number;
}) {
  // Função para calcular o custo do ingrediente
  const calcularCustoIngrediente = (item: any): number => {
    const quantidade = item.quantidade || 0;
    const fatorCorrecao = item.fator_correcao || 1.0;
    const custoUnitarioProduto = item.produto?.custo_unitario || 0;
    return quantidade * fatorCorrecao * custoUnitarioProduto;
  };

  const ingredientesRows = ingredientes
    .map((item) => {
      const fatorCorrecao = item.fator_correcao || 1.0;
      const custoUnitarioProduto = item.produto?.custo_unitario || 0;
      const valorTotal = calcularCustoIngrediente(item);
      return `
        <tr>
          <td>${item.produto.nome}</td>
          <td class="text-center">${item.unidade}</td>
          <td class="text-center">${item.quantidade.toFixed(3)}</td>
          <td class="text-center">${fatorCorrecao.toFixed(3)}</td>
          <td class="text-right">R$ ${custoUnitarioProduto.toFixed(2)}</td>
          <td class="text-right">R$ ${valorTotal.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  const fotoHTML = fotoCapa
    ? `
      <div class="info-image">
        <img src="${fotoCapa}" alt="${produto.nome}" />
      </div>
    `
    : "";

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
            font-size: 10px;
            line-height: 1.5;
            color: #1e293b;
            background: #ffffff;
          }

          .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 24px;
          }

          /* Cabeçalho Moderno */
          .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 14px 24px;
            margin-bottom: 16px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
          }

          .header h1 {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }

          .header-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 3px 10px;
            border-radius: 16px;
            font-size: 8px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }

          .header-subtitle {
            font-size: 9px;
            opacity: 0.9;
            font-weight: 400;
          }

          /* Card de Informações */
          .info-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1.3fr 1fr;
            gap: 0;
          }

          .info-content {
            padding: 16px;
            border-right: 1px solid #e2e8f0;
          }

          .info-row {
            margin-bottom: 12px;
          }

          .info-row:last-child {
            margin-bottom: 0;
          }

          .info-label {
            font-size: 8px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
          }

          .info-value {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.3;
          }

          .info-image {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 120px;
          }

          .info-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          /* Seção com título */
          .section {
            margin-bottom: 16px;
          }

          .section-header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px 8px 0 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .section-title {
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }

          .section-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
          }

          /* Tabela Moderna */
          .table-wrapper {
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
            overflow: hidden;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          thead {
            background: #f8fafc;
          }

          th {
            padding: 12px 8px;
            text-align: left;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 10px;
            border-bottom: 2px solid #e2e8f0;
          }

          th.center {
            text-align: center;
          }

          tbody tr {
            border-bottom: 1px solid #f1f5f9;
          }

          tbody tr:last-child {
            border-bottom: none;
          }

          tbody tr:hover {
            background: #f8fafc;
          }

          td {
            padding: 8px;
            color: #334155;
          }

          .total-row {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 700;
            font-size: 11px;
            color: #0f172a;
            border-top: 2px solid #059669;
          }

          .total-label {
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .total-value {
            font-size: 14px;
            color: #059669;
          }

          /* Modo de Preparo */
          .modo-preparo-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .modo-preparo-header {
            background: #f8fafc;
            padding: 12px 20px;
            border-bottom: 1px solid #e2e8f0;
          }

          .modo-preparo-title {
            font-size: 10px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .modo-preparo-content {
            padding: 16px 20px;
            line-height: 1.7;
            font-size: 12px;
            color: #334155;
          }

          .modo-preparo-content p {
            margin-bottom: 10px;
          }

          .modo-preparo-content ol {
            margin: 10px 0 10px 20px;
            padding-left: 10px;
            list-style-type: decimal;
          }

          .modo-preparo-content ul {
            margin: 10px 0 10px 20px;
            padding-left: 10px;
            list-style-type: disc;
          }

          .modo-preparo-content li {
            margin-bottom: 8px;
            line-height: 1.6;
            padding-left: 4px;
          }

          .modo-preparo-content ol ol {
            list-style-type: lower-alpha;
          }

          .modo-preparo-content ol ol ol {
            list-style-type: lower-roman;
          }

          .modo-preparo-content strong {
            font-weight: 700;
            color: #0f172a;
          }

          .modo-preparo-content em {
            font-style: italic;
          }

          .modo-preparo-content u {
            text-decoration: underline;
          }

          .modo-preparo-content h1,
          .modo-preparo-content h2,
          .modo-preparo-content h3 {
            font-weight: 700;
            margin: 14px 0 8px 0;
            color: #0f172a;
          }

          .modo-preparo-content h1 {
            font-size: 14px;
          }

          .modo-preparo-content h2 {
            font-size: 12px;
          }

          .modo-preparo-content h3 {
            font-size: 11px;
          }

          /* Footer Stats */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .stat-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .stat-label {
            font-size: 10px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #059669;
          }

          .stat-unit {
            font-size: 10px;
            color: #94a3b8;
            font-weight: 500;
            margin-left: 2px;
          }

          .text-right {
            text-align: right;
          }

          .text-center {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Cabeçalho Premium -->
          <div class="header">
            <div class="header-top">
              <h1>Ficha Técnica de Preparação</h1>
              <div class="header-badge">CÓDIGO ${produto.codigo}</div>
            </div>
            <div class="header-subtitle">Documento técnico de produção e controle de custos</div>
          </div>

          <!-- Card de Informações -->
          <div class="info-card">
            <div class="info-grid">
              <div class="info-content">
                <div class="info-row">
                  <div class="info-label">Preparação</div>
                  <div class="info-value">${produto.nome}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Categoria</div>
                  <div class="info-value" style="font-size: 12px;">${produto.grupo} • ${produto.setor}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Responsável</div>
                  <div class="info-value" style="font-size: 12px; color: #94a3b8;">_______________________________</div>
                </div>
              </div>
              ${fotoHTML}
            </div>
          </div>

          <!-- Tabela de Ingredientes -->
          <div class="section">
            <div class="section-header">
              <div class="section-title">Ingredientes & Insumos</div>
              <div class="section-badge">${ingredientes.length} ITENS</div>
            </div>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Ingrediente</th>
                    <th class="center" style="width: 45px;">UN</th>
                    <th class="center" style="width: 70px;">Qtd.</th>
                    <th class="center" style="width: 70px;">F.C.</th>
                    <th class="text-right" style="width: 75px;">Valor Unit.</th>
                    <th class="text-right" style="width: 75px;">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${ingredientesRows}
                </tbody>
              </table>
              <div class="total-row">
                <span class="total-label">Custo Total dos Insumos</span>
                <span class="total-value">R$ ${custoTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Modo de Preparo -->
          ${
            fichaTecnica.modo_preparo
              ? `
          <div class="modo-preparo-card">
            <div class="modo-preparo-header">
              <div class="modo-preparo-title">Modo de Preparo</div>
            </div>
            <div class="modo-preparo-content">${fichaTecnica.modo_preparo}</div>
          </div>
          `
              : ""
          }

          <!-- Cards de Estatísticas -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Rendimento</div>
              <div class="stat-value">${fichaTecnica.porcoes || 0}<span class="stat-unit">porções</span></div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Custo Total</div>
              <div class="stat-value">R$ ${custoTotal.toFixed(2)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Custo/Porção</div>
              <div class="stat-value">R$ ${custoPorPorcao.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
