import { Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-4">
      <Title>Relatórios</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Produção</h3>
          <p className="text-sm text-gray-500 mb-4">
            Exportar dados de produção em formato Excel
          </p>
          <Link href="/admin/reports/producao">
            <Button className="w-full">
              Acessar
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
