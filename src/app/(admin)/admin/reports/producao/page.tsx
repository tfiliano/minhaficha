"use client";

import { Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { downloadReport_modelo1, downloadReport_modelo2 } from "./actions";
import { MouseEventHandler, useTransition } from "react";

export default function ProducaoReportPage() {
  const [isPending, startTransition] = useTransition();

  const handleDownload = (modelo: string): MouseEventHandler => {
    return () => {
      startTransition(async () => {
        try {
          let fn: Function | null = null;
          switch (modelo) {
            case 'modelo1': fn = downloadReport_modelo1; break;
            case 'modelo2': fn = downloadReport_modelo2; break;
            // case 'modelo3': fn = downloadReport_modelo3; break;
          }

          if (fn) {
            const array = await fn();
            // Convert array back to buffer
            const buffer = new Uint8Array(array);
            // Create blob from buffer
            const blob = new Blob([buffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            // Create URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'producao.xlsx';
            document.body.appendChild(a);
            a.click();
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }
        } catch (error) {
          console.error("Error downloading file:", error);
        }
      });
    };
  };

  return (
    <div className="container mx-auto p-4">
      <Title>Relatório de Produção</Title>
      <div className="mt-4">
        <Button 
          onClick={handleDownload('modelo1')} 
          className="w-full md:w-auto"
          disabled={isPending}
        >
          {isPending ? "Gerando..." : "Exportar Excel Modelo 1"}
        </Button>
      </div>
      <div className="mt-4">
        <Button 
          onClick={handleDownload('modelo2')} 
          className="w-full md:w-auto"
          disabled={isPending}
        >
          {isPending ? "Gerando..." : "Exportar Excel Modelo 2"}
        </Button>
      </div>
      {/* <div className="mt-4">
        <Button 
          onClick={handleDownload('modelo3')} 
          className="w-full md:w-auto"
          disabled={isPending}
        >
          {isPending ? "Gerando..." : "Exportar Excel Modelo 3"}
        </Button>
      </div> */}
    </div>
  );
}
