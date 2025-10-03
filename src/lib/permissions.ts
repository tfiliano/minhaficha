import { createClient } from "@/utils/supabase";

/**
 * Tipos de ações que podem ser executadas em um recurso
 */
export type PermissionAction = "read" | "create" | "update" | "delete";

/**
 * Recursos disponíveis no sistema
 */
export type Resource =
  | "produtos"
  | "etiquetas"
  | "relatorios"
  | "ficha-tecnica"
  | "operadores"
  | "grupos"
  | "setores"
  | "armazenamentos"
  | "fabricantes"
  | "sifs"
  | "impressoras"
  | "templates"
  | "configuracoes"
  | "producao"
  | "entrada-insumos";

/**
 * Tipo de permissão (recurso + ação)
 */
export type Permission = `${Resource}:${PermissionAction}`;

/**
 * Resultado da verificação de permissão
 */
export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
}

/**
 * Informações de uma permissão do usuário
 */
export interface UserPermission {
  recurso: Resource;
  acao: PermissionAction;
  descricao: string;
}

/**
 * Verifica se um usuário tem uma permissão específica
 *
 * @param userId - ID do usuário
 * @param lojaId - ID da loja
 * @param resource - Recurso a verificar
 * @param action - Ação a verificar
 * @returns Promessa com o resultado da verificação
 */
export async function hasPermission(
  userId: string,
  lojaId: string,
  resource: Resource,
  action: PermissionAction
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Chamar a função do banco de dados
    const { data, error } = await supabase.rpc("check_user_permission", {
      p_user_id: userId,
      p_loja_id: lojaId,
      p_recurso_slug: resource,
      p_acao: action,
    });

    if (error) {
      console.error("Erro ao verificar permissão:", error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return false;
  }
}

/**
 * Busca todas as permissões de um usuário em uma loja
 *
 * @param userId - ID do usuário
 * @param lojaId - ID da loja
 * @returns Promessa com lista de permissões
 */
export async function getUserPermissions(
  userId: string,
  lojaId: string
): Promise<UserPermission[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_user_permissions", {
      p_user_id: userId,
      p_loja_id: lojaId,
    });

    if (error) {
      console.error("Erro ao buscar permissões:", error);
      return [];
    }

    return (data || []) as UserPermission[];
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return [];
  }
}

/**
 * Verifica se usuário pode ler um recurso
 */
export async function canRead(
  userId: string,
  lojaId: string,
  resource: Resource
): Promise<boolean> {
  return hasPermission(userId, lojaId, resource, "read");
}

/**
 * Verifica se usuário pode criar um recurso
 */
export async function canCreate(
  userId: string,
  lojaId: string,
  resource: Resource
): Promise<boolean> {
  return hasPermission(userId, lojaId, resource, "create");
}

/**
 * Verifica se usuário pode editar um recurso
 */
export async function canUpdate(
  userId: string,
  lojaId: string,
  resource: Resource
): Promise<boolean> {
  return hasPermission(userId, lojaId, resource, "update");
}

/**
 * Verifica se usuário pode deletar um recurso
 */
export async function canDelete(
  userId: string,
  lojaId: string,
  resource: Resource
): Promise<boolean> {
  return hasPermission(userId, lojaId, resource, "delete");
}

/**
 * Verifica múltiplas permissões de uma vez
 *
 * @param userId - ID do usuário
 * @param lojaId - ID da loja
 * @param permissions - Array de permissões no formato "recurso:acao"
 * @returns Promessa com objeto contendo resultado de cada permissão
 */
export async function checkMultiplePermissions(
  userId: string,
  lojaId: string,
  permissions: Permission[]
): Promise<Record<Permission, boolean>> {
  const results: Record<string, boolean> = {};

  // Executar verificações em paralelo
  await Promise.all(
    permissions.map(async (permission) => {
      const [resource, action] = permission.split(":") as [
        Resource,
        PermissionAction
      ];
      results[permission] = await hasPermission(
        userId,
        lojaId,
        resource,
        action
      );
    })
  );

  return results as Record<Permission, boolean>;
}

/**
 * Verifica se usuário tem pelo menos uma das permissões especificadas
 *
 * @param userId - ID do usuário
 * @param lojaId - ID da loja
 * @param permissions - Array de permissões
 * @returns true se tiver pelo menos uma permissão
 */
export async function hasAnyPermission(
  userId: string,
  lojaId: string,
  permissions: Permission[]
): Promise<boolean> {
  const results = await checkMultiplePermissions(userId, lojaId, permissions);
  return Object.values(results).some((hasPermission) => hasPermission);
}

/**
 * Verifica se usuário tem todas as permissões especificadas
 *
 * @param userId - ID do usuário
 * @param lojaId - ID da loja
 * @param permissions - Array de permissões
 * @returns true se tiver todas as permissões
 */
export async function hasAllPermissions(
  userId: string,
  lojaId: string,
  permissions: Permission[]
): Promise<boolean> {
  const results = await checkMultiplePermissions(userId, lojaId, permissions);
  return Object.values(results).every((hasPermission) => hasPermission);
}

/**
 * Retorna um objeto com flags de permissões para um recurso
 *
 * @param userId - ID do usuário
 * @param lojaId - ID da loja
 * @param resource - Recurso
 * @returns Objeto com flags canRead, canCreate, canUpdate, canDelete
 */
export async function getResourcePermissions(
  userId: string,
  lojaId: string,
  resource: Resource
): Promise<{
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}> {
  const permissions: Permission[] = [
    `${resource}:read`,
    `${resource}:create`,
    `${resource}:update`,
    `${resource}:delete`,
  ];

  const results = await checkMultiplePermissions(userId, lojaId, permissions);

  return {
    canRead: results[`${resource}:read`] || false,
    canCreate: results[`${resource}:create`] || false,
    canUpdate: results[`${resource}:update`] || false,
    canDelete: results[`${resource}:delete`] || false,
  };
}
