"use server";

import { createClient } from "@/utils/supabase";

export type UserType = "master" | "admin" | "manager" | "operator" | "user";
export type PermissionAction = "read" | "create" | "update" | "delete";

export interface Recurso {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
}

export interface Permissao {
  id: string;
  recurso_id: string;
  acao: PermissionAction;
  descricao: string | null;
}

export interface RolePermissao {
  id: string;
  role: UserType;
  permissao_id: string;
  loja_id: string | null;
}

export interface RecursoComPermissoes extends Recurso {
  permissoes: {
    read: { id: string; habilitado: boolean };
    create: { id: string; habilitado: boolean };
    update: { id: string; habilitado: boolean };
    delete: { id: string; habilitado: boolean };
  };
}

/**
 * Busca todos os recursos e suas permissões para um role específico
 */
export async function getRecursosComPermissoes(role: UserType) {
  try {
    const supabase = await createClient();

    // Buscar todos os recursos ativos
    const { data: recursos, error: recursosError } = await supabase
      .from("recursos")
      .select("*")
      .eq("ativo", true)
      .order("nome");

    if (recursosError) throw recursosError;

    // Buscar todas as permissões
    const { data: permissoes, error: permissoesError } = await supabase
      .from("permissoes")
      .select("*");

    if (permissoesError) throw permissoesError;

    // Buscar permissões habilitadas para o role
    const { data: rolePermissoes, error: rolePermissoesError } = await supabase
      .from("role_permissoes")
      .select("permissao_id")
      .eq("role", role)
      .is("loja_id", null); // Apenas permissões globais

    if (rolePermissoesError) throw rolePermissoesError;

    const permissoesHabilitadas = new Set(
      rolePermissoes?.map((rp) => rp.permissao_id) || []
    );

    // Montar estrutura de dados
    const recursosComPermissoes: RecursoComPermissoes[] = recursos!.map((recurso) => {
      const permissoesDoRecurso = permissoes!.filter(
        (p) => p.recurso_id === recurso.id
      );

      const permRead = permissoesDoRecurso.find((p) => p.acao === "read");
      const permCreate = permissoesDoRecurso.find((p) => p.acao === "create");
      const permUpdate = permissoesDoRecurso.find((p) => p.acao === "update");
      const permDelete = permissoesDoRecurso.find((p) => p.acao === "delete");

      return {
        ...recurso,
        permissoes: {
          read: {
            id: permRead?.id || "",
            habilitado: permRead ? permissoesHabilitadas.has(permRead.id) : false,
          },
          create: {
            id: permCreate?.id || "",
            habilitado: permCreate ? permissoesHabilitadas.has(permCreate.id) : false,
          },
          update: {
            id: permUpdate?.id || "",
            habilitado: permUpdate ? permissoesHabilitadas.has(permUpdate.id) : false,
          },
          delete: {
            id: permDelete?.id || "",
            habilitado: permDelete ? permissoesHabilitadas.has(permDelete.id) : false,
          },
        },
      };
    });

    return {
      success: true,
      data: recursosComPermissoes,
    };
  } catch (error: any) {
    console.error("Erro ao buscar recursos com permissões:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Atualiza as permissões de um role
 */
export async function updateRolePermissoes(
  role: UserType,
  permissoes: { permissaoId: string; habilitado: boolean }[]
) {
  try {
    const supabase = await createClient();

    // Remover todas as permissões globais do role
    await supabase
      .from("role_permissoes")
      .delete()
      .eq("role", role)
      .is("loja_id", null);

    // Inserir apenas as permissões habilitadas
    const permissoesHabilitadas = permissoes
      .filter((p) => p.habilitado)
      .map((p) => ({
        role,
        permissao_id: p.permissaoId,
        loja_id: null,
      }));

    if (permissoesHabilitadas.length > 0) {
      const { error } = await supabase
        .from("role_permissoes")
        .insert(permissoesHabilitadas);

      if (error) throw error;
    }

    return {
      success: true,
      message: `Permissões do role ${role} atualizadas com sucesso!`,
    };
  } catch (error: any) {
    console.error("Erro ao atualizar permissões:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Habilita ou desabilita uma permissão específica para um role
 */
export async function toggleRolePermissao(
  role: UserType,
  permissaoId: string,
  habilitado: boolean
) {
  try {
    const supabase = await createClient();

    if (habilitado) {
      // Adicionar permissão
      const { error } = await supabase.from("role_permissoes").insert({
        role,
        permissao_id: permissaoId,
        loja_id: null,
      });

      if (error && error.code !== "23505") throw error; // Ignorar erro de duplicação
    } else {
      // Remover permissão
      const { error } = await supabase
        .from("role_permissoes")
        .delete()
        .eq("role", role)
        .eq("permissao_id", permissaoId)
        .is("loja_id", null);

      if (error) throw error;
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Erro ao alternar permissão:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
