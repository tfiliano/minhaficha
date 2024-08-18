"use server";

import { createClient } from "@/utils/supabase";

export type Inputs = {
  items: any[];
  peso_bruto: number | null;
  peso_liquido: number;
  peso_perda: number;
  fator_correcao: number;

  produto_nome?: string | null;
  produto_id?: string | null;
  produto?: string | null;
  setor?: string | null;
  operador?: string | null;
  operador_id?: string | null;
};

export async function saveProducao(producao: Inputs) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("producao").insert(producao);
    if (error) {
      return { error: error };
    }
    return data;
  } catch (error) {
    return { error: error };
  }
}
