"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ExportButtons() {
  const [activeTab, setActiveTab] = useState("producao");
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const searchParams = useSearchParams();

  // Escutar evento customizado quando a tab muda
  useEffect(() => {
    const handleTabChange = (e: CustomEvent) => {
      setActiveTab(e.detail.tab);
    };

    window.addEventListener("relatorio-tab-change" as any, handleTabChange as any);

    return () => {
      window.removeEventListener("relatorio-tab-change" as any, handleTabChange as any);
    };
  }, []);

  const handleDownloadPDF = async () => {
    setLoadingPDF(true);

    try {
      // Construir URL com todos os query params + tipo de relatório
      const params = new URLSearchParams(searchParams.toString());
      params.set("tipo", activeTab);

      const url = `/api/relatorios/pdf?${params.toString()}`;

      // Fazer download do PDF
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erro ao gerar PDF");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `relatorio-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoadingExcel(true);

    try {
      // Construir URL com todos os query params + tipo de relatório
      const params = new URLSearchParams(searchParams.toString());
      params.set("tipo", activeTab);

      const url = `/api/relatorios/excel?${params.toString()}`;

      // Fazer download do Excel
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erro ao gerar Excel");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `relatorio-${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      alert("Erro ao gerar Excel. Tente novamente.");
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="gap-2"
        onClick={handleDownloadExcel}
        disabled={loadingExcel}
      >
        {loadingExcel ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {loadingExcel ? "Gerando..." : "Excel"}
        </span>
      </Button>
      <Button
        className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        onClick={handleDownloadPDF}
        disabled={loadingPDF}
      >
        {loadingPDF ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {loadingPDF ? "Gerando..." : "PDF"}
        </span>
      </Button>
    </div>
  );
}
