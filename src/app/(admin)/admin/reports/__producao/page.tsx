import { Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase";

export default async function ProducaoReportPage() {
  const supabase = await createClient();

  async function downloadReport() {
    "use server";
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/reports/producao/excel`, {
      method: "GET",
    });
    
    const blob = await response.blob();
    return new Response(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=producao.xlsx",
      },
    });
  }

  return (
    <div className="container mx-auto p-4">
      <Title>Relatório de Produção</Title>
      <div className="mt-4">
        <form action={downloadReport}>
          <Button type="submit" className="w-full md:w-auto">
            Exportar Excel
          </Button>
        </form>
      </div>
    </div>
  );
}
