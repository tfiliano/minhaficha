import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

interface ExportOptions {
  filename: string;
  title?: string;
}

/**
 * Exporta um elemento HTML para PDF
 */
export async function exportToPDF(elementId: string, options: ExportOptions) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${options.filename}.pdf`);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
  }
}

/**
 * Exporta dados para Excel
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions
) {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, options.title || "Dados");

    // Auto-size columns
    const maxWidth = 50;
    const colWidths: number[] = [];
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxLen = 0;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const len = cell.v.toString().length;
          maxLen = Math.max(maxLen, len);
        }
      }
      colWidths[C] = Math.min(maxLen + 2, maxWidth);
    }

    worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));

    XLSX.writeFile(workbook, `${options.filename}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
  }
}

/**
 * Exporta gráfico (SVG ou Canvas) para imagem PNG
 */
export async function exportChartToImage(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error("Error exporting chart to image:", error);
  }
}

/**
 * Prepara dados para exportação formatando valores
 */
export function prepareDataForExport<T extends Record<string, any>>(
  data: T[],
  formatters?: Partial<Record<keyof T, (value: any) => string>>
): Record<string, any>[] {
  return data.map((row) => {
    const formattedRow: Record<string, any> = {};
    Object.keys(row).forEach((key) => {
      const formatter = formatters?.[key as keyof T];
      formattedRow[key] = formatter ? formatter(row[key]) : row[key];
    });
    return formattedRow;
  });
}
