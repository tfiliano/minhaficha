"use client";

import { VERSION_APP } from "@/utils/consts";
import { Lightbulb } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

const routeNames: Record<string, string> = {
  "/": "Início",
  "/producao": "Produção",
  "/operador": "Operador",
  "/entrada-insumo": "Entrada de Insumo",
  "/relatorios": "Relatórios",
  "/admin": "Administração",
  "/admin/produtos": "Produtos",
  "/admin/operadores": "Operadores",
  "/admin/grupos": "Grupos",
  "/admin/setores": "Setores",
  "/admin/armazenamentos": "Armazenamentos",
  "/admin/fabricantes": "Fabricantes",
  "/admin/sifs": "SIFs",
  "/admin/etiquetas": "Etiquetas",
  "/admin/impressoras": "Impressoras",
  "/admin/templates/etiquetas": "Templates",
  "/admin/impressao": "Fila de Impressão",
  "/admin/reports": "Relatórios",
  "/admin/configuracoes": "Configurações",
};

export function Logo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Encontrar o nome da rota atual
  const getCurrentRoute = () => {
    // Se estiver em /operador, verificar o query param "operacao"
    if (pathname === "/operador") {
      const operacao = searchParams?.get("operacao");
      if (operacao) {
        return operacao;
      }
    }

    // Tentar match exato primeiro
    if (routeNames[pathname || ""]) {
      return routeNames[pathname || ""];
    }

    // Tentar encontrar a rota pai mais próxima
    const pathParts = pathname?.split("/").filter(Boolean) || [];
    for (let i = pathParts.length; i > 0; i--) {
      const testPath = "/" + pathParts.slice(0, i).join("/");
      if (routeNames[testPath]) {
        return routeNames[testPath];
      }
    }

    return null;
  };

  const currentRoute = getCurrentRoute();

  return (
    <>
      <div className="p-2 bg-primary rounded-xl">
        <Lightbulb className="h-5 w-5 text-white" />
      </div>
      {/* Mostrar texto no mobile e desktop */}
      <div className="flex flex-col">
        <h1 className="font-bold text-sm sm:text-base">Minha Ficha</h1>
        {currentRoute ? (
          <small className="text-[10px] text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
            {currentRoute}
          </small>
        ) : (
          <small className="text-[10px] text-primary/50 hidden sm:block">{VERSION_APP}</small>
        )}
      </div>
    </>
  );
}
