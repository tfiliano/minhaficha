"use client";

import { useResourcePermissions } from "@/hooks/use-permissions";
import type { Resource } from "@/lib/permissions";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  /** Recurso necessário para acessar a rota */
  resource: Resource;
  /** Se true, requer permissão de criar (caso contrário, apenas ler) */
  requireCreate?: boolean;
  /** Se true, requer permissão de editar */
  requireUpdate?: boolean;
  /** Se true, requer permissão de deletar */
  requireDelete?: boolean;
  /** Conteúdo da rota */
  children: ReactNode;
  /** URL para redirecionar se não tiver permissão */
  redirectTo?: string;
}

/**
 * Componente wrapper para proteger rotas inteiras baseado em permissões
 *
 * @example
 * ```tsx
 * export default function ProdutosPage() {
 *   return (
 *     <ProtectedRoute resource="produtos">
 *       <div>Conteúdo da página de produtos</div>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({
  resource,
  requireCreate = false,
  requireUpdate = false,
  requireDelete = false,
  children,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { canRead, canCreate, canUpdate, canDelete, loading } =
    useResourcePermissions(resource);

  const hasRequiredPermissions =
    canRead &&
    (!requireCreate || canCreate) &&
    (!requireUpdate || canUpdate) &&
    (!requireDelete || canDelete);

  useEffect(() => {
    if (!loading && !hasRequiredPermissions && redirectTo) {
      router.push(redirectTo);
    }
  }, [loading, hasRequiredPermissions, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasRequiredPermissions) {
    return (
      <div className="container mx-auto p-4 max-w-2xl mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription className="mt-2">
            Você não tem permissão para acessar este recurso.
            {!canRead && " Permissão de visualização necessária."}
            {requireCreate && !canCreate && " Permissão de criação necessária."}
            {requireUpdate && !canUpdate && " Permissão de edição necessária."}
            {requireDelete && !canDelete && " Permissão de exclusão necessária."}
          </AlertDescription>
          <div className="mt-4">
            <Button onClick={() => router.push(redirectTo)} variant="outline">
              Voltar
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
