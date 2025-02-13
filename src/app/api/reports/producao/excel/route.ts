import { createClient } from "@/utils/supabase";
import * as XLSX from "xlsx";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch production data
    const { data: producoes, error } = await supabase
      .from("producoes")
      .select("*")
      .order("produto");

    if (error) throw error;

    // Group productions by product
    const groupedProducoes = producoes.reduce((acc: Record<string, any[]>, curr) => {
      const produto = curr.produto || 'Sem Produto';
      if (!acc[produto]) {
        acc[produto] = [];
      }
      acc[produto].push(curr);
      return acc;
    }, {} as Record<string, any[]>);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Process each product group
    Object.entries(groupedProducoes).forEach(([produto, items]: [string, any]) => {
      // Calculate totals
      const totalBruto = items.reduce((sum: number, item: any) => sum + (item.peso_bruto || 0), 0);
      const totalLiquido = items.reduce((sum: number, item: any) => sum + (item.peso_liquido || 0), 0);
      const perda = totalBruto - totalLiquido;
      const fatorC = totalBruto / totalLiquido;

      // Group items by portion type
      const portions = items.reduce((acc: any, curr: any) => {
        if (!curr.items) return acc;
        curr.items.forEach((item: any) => {
          if (!acc[item.nome]) {
            acc[item.nome] = {
              quantidade: 0,
              peso: 0,
            };
          }
          acc[item.nome].quantidade += item.quantidade || 0;
          acc[item.nome].peso += item.peso || 0;
        });
        return acc;
      }, {});

      // Create worksheet data
      const wsData = [
        [produto + " Bruto", totalBruto.toFixed(3), "", "", "Porções", "Peso médio"],
        [produto + " Liquido", totalLiquido.toFixed(3), "", "", "", ""],
      ];

      // Add portions
      Object.entries(portions).forEach(([nome, data]: [string, any]) => {
        const percentagem = ((data.peso / totalLiquido) * 100).toFixed(0) + "%";
        const pesoMedio = (data.peso / data.quantidade).toFixed(3);
        wsData.push([
          nome,
          data.peso.toFixed(3),
          percentagem,
          "",
          data.quantidade,
          pesoMedio
        ]);
      });

      // Add loss row
      wsData.push([
        "Perda",
        perda.toFixed(3),
        ((perda / totalBruto) * 100).toFixed(0) + "%",
        "",
        "Fator C",
        fatorC.toFixed(2)
      ]);

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Style cells
      const range = XLSX.utils.decode_range(ws["!ref"]!);
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cell_address]) continue;

          // Initialize cell style if not exists
          if (!ws[cell_address].s) ws[cell_address].s = {};

          // Style for headers (first row)
          if (R === 0) {
            ws[cell_address].s.font = { bold: true };
          }

          // Style for liquido row
          if (R === 1) {
            ws[cell_address].s.font = { italic: true };
          }

          // Style for peso medio column
          if (C === 5 && R > 1 && R < range.e.r) {
            ws[cell_address].s.fill = { fgColor: { rgb: "FFFF00" } };
          }

          // Style for Fator C
          if (R === range.e.r && C === 5) {
            ws[cell_address].s.fill = { fgColor: { rgb: "90EE90" } };
          }

          // Style for Perda row
          if (R === range.e.r) {
            ws[cell_address].s.font = { color: { rgb: "FF0000" } };
          }
        }
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, produto);
    });

    // Generate buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Return response
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=producao.xlsx",
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json({ error: "Error generating Excel file" }, { status: 500 });
  }
}
