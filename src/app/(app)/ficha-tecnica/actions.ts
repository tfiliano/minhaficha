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
  modo_preparo?: string;
  tempo_preparo_minutos?: number;
};

export type FichaTecnicaFoto = {
  id?: string;
  ficha_tecnica_id: string;
  url: string;
  is_capa?: boolean;
  ordem?: number;
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
          modo_preparo: data.modo_preparo,
          tempo_preparo_minutos: data.tempo_preparo_minutos,
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
          modo_preparo: data.modo_preparo,
          tempo_preparo_minutos: data.tempo_preparo_minutos,
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

/**
 * Buscar fotos de uma ficha técnica
 */
export async function getFotos(fichaTecnicaId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("fichas_tecnicas_fotos")
      .select("*")
      .eq("ficha_tecnica_id", fichaTecnicaId)
      .order("ordem", { ascending: true });

    if (error) {
      console.error("Erro ao buscar fotos:", error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Erro ao buscar fotos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      data: []
    };
  }
}

/**
 * Adicionar uma foto à ficha técnica
 */
export async function addFoto(foto: FichaTecnicaFoto) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("fichas_tecnicas_fotos")
      .insert({
        ficha_tecnica_id: foto.ficha_tecnica_id,
        url: foto.url,
        is_capa: foto.is_capa ?? false,
        ordem: foto.ordem ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar foto:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao adicionar foto:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Remover uma foto da ficha técnica
 */
export async function deleteFoto(fotoId: string) {
  const supabase = await createClient();

  try {
    // Buscar a URL da foto antes de deletar para remover do storage
    const { data: foto } = await supabase
      .from("fichas_tecnicas_fotos")
      .select("url")
      .eq("id", fotoId)
      .single();

    if (foto?.url) {
      // Extrair o path do storage da URL
      const urlParts = foto.url.split('/arquivos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        // Remover arquivo do storage
        await supabase.storage.from('arquivos').remove([filePath]);
      }
    }

    // Deletar registro do banco
    const { error } = await supabase
      .from("fichas_tecnicas_fotos")
      .delete()
      .eq("id", fotoId);

    if (error) {
      console.error("Erro ao remover foto:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao remover foto:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Definir uma foto como capa
 */
export async function setFotoCapa(fotoId: string, fichaTecnicaId: string) {
  const supabase = await createClient();

  try {
    // O trigger do banco já garante que apenas uma foto será capa
    // Apenas precisamos marcar a foto selecionada como capa
    const { error } = await supabase
      .from("fichas_tecnicas_fotos")
      .update({ is_capa: true })
      .eq("id", fotoId)
      .eq("ficha_tecnica_id", fichaTecnicaId);

    if (error) {
      console.error("Erro ao definir foto como capa:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao definir foto como capa:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Atualizar ordem de uma foto
 */
export async function updateFotoOrdem(fotoId: string, ordem: number) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("fichas_tecnicas_fotos")
      .update({ ordem })
      .eq("id", fotoId);

    if (error) {
      console.error("Erro ao atualizar ordem da foto:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar ordem da foto:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}
