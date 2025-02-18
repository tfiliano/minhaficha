"use client";

import { Title } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Printer } from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const handleExportProducao = async () => {
    try {
      // Trigger file download
      window.location.href = "/api/reports/producao/excel";
    } catch (error: any) {
      toast.error(error.message || "Erro ao exportar relatório");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Title>Relatórios</Title>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Card className="p-6 hover:bg-accent transition-colors">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <FileSpreadsheet className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-semibold">Produção</h3>
                <p className="text-sm text-muted-foreground">
                  Exportar dados de produção
                </p>
              </div>
            </div>
            <Button onClick={handleExportProducao}>
              Exportar Excel
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:bg-accent transition-colors">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Printer className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-semibold">Impressões</h3>
                <p className="text-sm text-muted-foreground">
                  Histórico de impressões
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/admin/impressao"}>
              Ver Histórico
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
