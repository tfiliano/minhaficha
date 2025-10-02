"use server";

import { createClient } from "@/utils/supabase";

export type FichaTecnicaItem = {
  id?: string;
  produto_ingrediente_id: string;
  quantidade: number;
  unidade: string;
  custo_unitario?: number;
  ordem?: number;
  observacoes?: string;
};

export type FichaTecnica = {
  id?: string;
  produto_cardapio_id: string;
  nome?: string;
  porcoes?: number;
  observacoes?: string;
  ativo?: boolean;
};

/**
 * Criar ou atualizar uma ficha técnica
 */
export async function upsertFichaTecnica(data: FichaTecnica) {
  const supabase = await createClient();

  try {
    // Verificar se já existe uma ficha técnica para este produto
    const { data: existing } = await supabase
      .from("fichas_tecnicas")
      .select("id")
      .eq("produto_cardapio_id", data.produto_cardapio_id)
      .maybeSingle();

    let result;

    if (existing?.id) {
      // Atualizar ficha existente
      result = await supabase
        .from("fichas_tecnicas")
        .update({
          nome: data.nome,
          porcoes: data.porcoes,
          observacoes: data.observacoes,
          ativo: data.ativo ?? true,
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      // Criar nova ficha técnica
      result = await supabase
        .from("fichas_tecnicas")
        .insert({
          produto_cardapio_id: data.produto_cardapio_id,
          nome: data.nome,
          porcoes: data.porcoes,
          observacoes: data.observacoes,
          ativo: data.ativo ?? true,
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error("Erro ao salvar ficha técnica:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Erro ao salvar ficha técnica:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Adicionar um ingrediente à ficha técnica
 */
export async function addIngrediente(fichaTecnicaId: string, item: FichaTecnicaItem) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("fichas_tecnicas_itens")
      .insert({
        ficha_tecnica_id: fichaTecnicaId,
        produto_ingrediente_id: item.produto_ingrediente_id,
        quantidade: item.quantidade,
        unidade: item.unidade,
        custo_unitario: item.custo_unitario,
        ordem: item.ordem ?? 0,
        observacoes: item.observacoes,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar ingrediente:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao adicionar ingrediente:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Atualizar um ingrediente da ficha técnica
 */
export async function updateIngrediente(itemId: string, updates: Partial<FichaTecnicaItem>) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("fichas_tecnicas_itens")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar ingrediente:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao atualizar ingrediente:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Remover um ingrediente da ficha técnica
 */
export async function removeIngrediente(itemId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("fichas_tecnicas_itens")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Erro ao remover ingrediente:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao remover ingrediente:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Buscar produtos para usar como ingredientes
 */
export async function searchProdutos(searchTerm: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("produtos")
      .select("id, codigo, nome, unidade, grupo")
      .eq("ativo", true)
      .or(`nome.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`)
      .limit(20);

    if (error) {
      console.error("Erro ao buscar produtos:", error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      data: []
    };
  }
}
