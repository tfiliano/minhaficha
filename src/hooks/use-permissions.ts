"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Resource, PermissionAction, UserPermission } from "@/lib/permissions";

/**
 * Estado de permissões do usuário
 */
interface PermissionsState {
  permissions: UserPermission[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook para gerenciar permissões do usuário no client-side
 *
 * @returns Estado das permissões e funções helper
 */
export function usePermissions() {
  const [state, setState] = useState<PermissionsState>({
    permissions: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const supabase = createClient();

      // Buscar usuário autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState({
          permissions: [],
          loading: false,
          error: new Error("Usuário não autenticado"),
        });
        return;
      }

      // Buscar loja_id do cookie
      const lojaId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("minhaficha_loja_id="))
        ?.split("=")[1];

      if (!lojaId) {
        setState({
          permissions: [],
          loading: false,
          error: new Error("Loja não selecionada"),
        });
        return;
      }

      // Buscar permissões do usuário
      const { data, error } = await supabase.rpc("get_user_permissions", {
        p_user_id: user.id,
        p_loja_id: lojaId,
      });

      if (error) {
        throw error;
      }

      setState({
        permissions: (data || []) as UserPermission[],
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        permissions: [],
        loading: false,
        error: error as Error,
      });
    }
  }

  /**
   * Verifica se usuário tem uma permissão específica
   */
  function hasPermission(resource: Resource, action: PermissionAction): boolean {
    return state.permissions.some(
      (p) => p.recurso === resource && p.acao === action
    );
  }

  /**
   * Verifica se usuário pode ler um recurso
   */
  function canRead(resource: Resource): boolean {
    return hasPermission(resource, "read");
  }

  /**
   * Verifica se usuário pode criar um recurso
   */
  function canCreate(resource: Resource): boolean {
    return hasPermission(resource, "create");
  }

  /**
   * Verifica se usuário pode editar um recurso
   */
  function canUpdate(resource: Resource): boolean {
    return hasPermission(resource, "update");
  }

  /**
   * Verifica se usuário pode deletar um recurso
   */
  function canDelete(resource: Resource): boolean {
    return hasPermission(resource, "delete");
  }

  /**
   * Retorna todas as permissões para um recurso
   */
  function getResourcePermissions(resource: Resource) {
    return {
      canRead: canRead(resource),
      canCreate: canCreate(resource),
      canUpdate: canUpdate(resource),
      canDelete: canDelete(resource),
    };
  }

  /**
   * Recarrega as permissões do usuário
   */
  async function reload() {
    await loadPermissions();
  }

  return {
    permissions: state.permissions,
    loading: state.loading,
    error: state.error,
    hasPermission,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    getResourcePermissions,
    reload,
  };
}

/**
 * Hook simplificado para verificar uma permissão específica
 *
 * @param resource - Recurso a verificar
 * @param action - Ação a verificar
 * @returns Se o usuário tem a permissão
 */
export function useCanAccess(resource: Resource, action: PermissionAction): boolean {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return false;
  }

  return hasPermission(resource, action);
}

/**
 * Hook para verificar permissões de um recurso específico
 *
 * @param resource - Recurso a verificar
 * @returns Objeto com flags de permissões
 */
export function useResourcePermissions(resource: Resource) {
  const { getResourcePermissions, loading } = usePermissions();

  if (loading) {
    return {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      loading: true,
    };
  }

  return {
    ...getResourcePermissions(resource),
    loading: false,
  };
}
