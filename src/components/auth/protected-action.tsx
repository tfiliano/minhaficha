"use client";

import { useCanAccess } from "@/hooks/use-permissions";
import type { Resource, PermissionAction } from "@/lib/permissions";
import type { ReactNode } from "react";

interface ProtectedActionProps {
  /** Recurso a verificar */
  resource: Resource;
  /** Ação a verificar */
  action: PermissionAction;
  /** Conteúdo a renderizar se tiver permissão */
  children: ReactNode;
  /** Componente alternativo a renderizar se não tiver permissão */
  fallback?: ReactNode;
  /** Se true, renderiza null em vez do fallback quando não tem permissão */
  hideIfUnauthorized?: boolean;
}

/**
 * Componente que renderiza children apenas se o usuário tiver a permissão especificada
 *
 * @example
 * ```tsx
 * <ProtectedAction resource="produtos" action="create">
 *   <Button>Criar Produto</Button>
 * </ProtectedAction>
 * ```
 */
export function ProtectedAction({
  resource,
  action,
  children,
  fallback,
  hideIfUnauthorized = false,
}: ProtectedActionProps) {
  const hasAccess = useCanAccess(resource, action);

  if (!hasAccess) {
    if (hideIfUnauthorized) {
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
