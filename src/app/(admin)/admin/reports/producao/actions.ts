"use server";

import { createClient } from "@/utils/supabase";
import * as XLSX from "xlsx";

interface Producao {
  created_at: string;
  peso_bruto: number;
  quantidade: number;
  items?: Array<{
    nome: string;
    quantidade: number;
    peso: number;
    peso_medio: number;
  }>;
  operador: string;
  produtos?: {
    nome: string;
  };
  operadores?: {
    nome: string;
  };
}

export async function downloadReport_modelo2(): Promise<Uint8Array> {
  try {
    const supabase = await createClient();

    const { data: producoes, error } = await supabase
      .from("producoes")
      .select(`
        *,
        produtos (
          nome
        ),
        operadores (
          nome
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Create workbook with single worksheet
    const wb = XLSX.utils.book_new();
    
    // Define headers
    const headers = [
      "Produto",
      "Produto Pai",
      "Data",
      "Responsável",
      "Quantidade",
      "Peso",
      "Tipo",
      "Peso Médio"
    ];
    // Produto	Produto Pai	Data	Responsável	 Quantidade 	 Peso 	Tipo	Peso Médio



    // Prepare data rows
    const rows = (producoes as unknown as Producao[]).reduce((prev, curr) => {
      const dataProd = new Date(curr.created_at).toLocaleDateString('pt-BR');
      const operador = curr.operadores?.nome || "";
      const produtoPai = curr.produtos?.nome || "";
      
      const quantidade = (Number(curr.quantidade) || 1);
      const peso = (Number(curr.peso_bruto) || 1);
      const pesoMedio = peso / quantidade;
      prev.push([
        produtoPai,
        "",
        dataProd,
        operador,
        quantidade.toFixed(2),
        peso.toFixed(3),
        'Produto',
        pesoMedio.toFixed(3),
      ]);

      curr.items?.map((item: any) => {
        const produto = item.nome
        const quantidade = Number(item.quantidade) || 0;
        const peso = Number(item.peso) || 0;
        const pesoMedio = Number(item.peso_medio) || 0;
        
        prev.push([
          produto,
          produtoPai,
          dataProd,
          operador,
          quantidade.toFixed(2),
          peso.toFixed(3),
          'Sub-Produto',
          pesoMedio.toFixed(3),
        ]);
      })
      
      return prev;
    }, [] as Array<any>);

    // Create worksheet with headers and data
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // Produto
      { wch: 30 }, // Produto Pai
      { wch: 12 }, // Data
      { wch: 20 }, // Operador
      { wch: 12 }, // Quantidade
      { wch: 12 }, // Peso
      { wch: 20 }, // Tipo
      { wch: 12 }  // Peso Medio
    ];

    // Style headers
    const range = XLSX.utils.decode_range(ws["!ref"]!);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const headerAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[headerAddress].s) ws[headerAddress].s = {};
      ws[headerAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center" }
      };
    }

    // Style data cells
    for (let R = 1; R <= range.e.r; R++) {
      for (let C = 0; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        if (!ws[cellAddress].s) ws[cellAddress].s = {};

        // Align numbers right, text left
        if (C >= 2) { // Numeric columns
          ws[cellAddress].s.alignment = { horizontal: "right" };
        } else {
          ws[cellAddress].s.alignment = { horizontal: "left" };
        }

        // Alternate row colors
        if (R % 2 === 0) {
          ws[cellAddress].s.fill = { fgColor: { rgb: "F2F2F2" } };
        }
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Produção");

    // Generate buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Convert buffer to array for serialization
    return new Uint8Array(buf);
  } catch (error) {
    console.error("Error generating Excel:", error);
    throw error;
  }
}

export async function downloadReport_modelo1(): Promise<Number[]> {
  try {
    const supabase = await createClient();

    // Fetch production data with product names
    const { data: producoes, error } = await supabase
      .from("producoes")
      .select(`
        *,
        produtos (
          nome
        )
      `)
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

    // Create workbook with single worksheet
    const wb = XLSX.utils.book_new();
    let wsData: any[] = [];

    // Process each product group
    Object.entries(groupedProducoes).forEach(([produto, items]: [string, any], index) => {
      // Add spacing between products
      if (index > 0) {
        wsData.push([]);
        wsData.push([]);
      }

      // Get product name from the first item
      const productName = items[0]?.produtos?.nome || produto;

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

      // Add product data
      wsData.push([productName + " Bruto", totalBruto.toFixed(3), "", "", "Porções", "Peso médio"]);
      wsData.push([productName + " Liquido", totalLiquido.toFixed(3), "", "", "", ""]);

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
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Style cells
    const range = XLSX.utils.decode_range(ws["!ref"]!);
    let currentProduct = -1;
    let rowsInCurrentProduct = 0;

    for (let R = range.s.r; R <= range.e.r; R++) {
      // Check if this is an empty row (product separator)
      const firstCell = ws[XLSX.utils.encode_cell({ r: R, c: 0 })];
      if (!firstCell) {
        currentProduct++;
        rowsInCurrentProduct = 0;
        continue;
      }

      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell_address]) continue;

        // Initialize cell style if not exists
        if (!ws[cell_address].s) ws[cell_address].s = {};

        // Style for headers (first row of each product)
        if (rowsInCurrentProduct === 0) {
          ws[cell_address].s.font = { bold: true };
        }

        // Style for liquido row (second row of each product)
        if (rowsInCurrentProduct === 1) {
          ws[cell_address].s.font = { italic: true };
        }

        // Style for peso medio column
        if (C === 5 && rowsInCurrentProduct > 1 && !ws[XLSX.utils.encode_cell({ r: R + 1, c: 0 })]?.v?.includes("Perda")) {
          ws[cell_address].s.fill = { fgColor: { rgb: "FFFF00" } };
        }

        // Style for Fator C
        const cellValue = ws[XLSX.utils.encode_cell({ r: R, c: 0 })]?.v;
        if (cellValue?.includes("Perda") && C === 5) {
          ws[cell_address].s.fill = { fgColor: { rgb: "90EE90" } };
        }

        // Style for Perda row
        if (cellValue?.includes("Perda")) {
          ws[cell_address].s.font = { color: { rgb: "FF0000" } };
        }
      }

      rowsInCurrentProduct++;
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Produção");

    // Generate buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Convert buffer to array for serialization
    return Array.from(new Uint8Array(buf));
  } catch (error) {
    console.error("Error generating Excel:", error);
    throw error;
  }
}
