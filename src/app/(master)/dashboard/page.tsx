import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { Building2, Store, Users } from "lucide-react";
import Link from "next/link";

async function getSummary() {
  // Usar cliente admin para ver TODAS as lojas e usuários
  const supabase = await createSupabaseServerAdmin();
  const { data: lojas } = await supabase.from("lojas").select();
  const { data: usuarios } = await supabase.from("usuarios").select();

  console.log("Master Dashboard - Lojas:", lojas?.length || 0, "Usuários:", usuarios?.length || 0);

  return { lojas, usuarios };
}

export default async function DashboardPage() {
  const { lojas, usuarios } = await getSummary();

  return (
    <div className="flex flex-col gap-6 pb-14">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Lojas
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lojas?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Lojas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(lojas || []).map((loja) => (
                <li key={loja.id} className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{loja.nome}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/lojas" className="mt-4 block">
              <Button className="w-full">Ver Todas as Lojas</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Usuários Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(usuarios || []).map((user) => (
                <li key={user.id} className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{user.name}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/usuarios" className="mt-4 block">
              <Button className="w-full">Ver Todos os Usuários</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
