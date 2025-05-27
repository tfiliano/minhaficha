import { createClient } from "@/utils/supabase";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get all production records
    const { data: producoes, error } = await supabase
      .from("producoes")
      .select(`
        *,
        produto:produtos (
          nome
        ),
        grupo:grupos (
          nome
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform data for Excel
    const excelData = producoes.map((producao) => {
      const items = producao.items as Array<{
        nome: string;
        peso: number;
        porcoes: number;
        peso_medio: number;
      }> | null;

      return {
        "Data": new Date(producao.created_at).toLocaleDateString("pt-BR"),
        "Produto": producao.produto?.nome || "",
        "Grupo": producao.grupo?.nome || "",
        "Peso Bruto": producao.peso_bruto || 0,
        "Peso Líquido": producao.peso_liquido || 0,
        "Perda": producao.peso_perda || 0,
        "Fator Correção": producao.fator_correcao || 0,
        "Items": items ? items.map(item => `${item.nome}: ${item.peso}kg (${item.porcoes} porções)`).join("\n") : "",
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 12 },  // Data
      { wch: 30 },  // Produto
      { wch: 20 },  // Grupo
      { wch: 12 },  // Peso Bruto
      { wch: 12 },  // Peso Líquido
      { wch: 12 },  // Perda
      { wch: 12 },  // Fator Correção
      { wch: 40 },  // Items
    ];
    ws["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Produções");

    // Generate buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Return response with Excel file
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=producoes.xlsx"
      }
    });

  } catch (error: any) {
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      { error: error.message || "Error generating Excel file" },
      { status: 500 }
    );
  }
}
