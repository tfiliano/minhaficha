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

export async function saveProducao(producao: Inputs): Promise<{ error?: any; data?: any[] }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("producoes").insert(producao).select();
    if (error) {
      console.error(1, error)
      return { error: error };
    }
    
    //preciso colocar um Loading, com feedback pro usuario saber se salvou ou nao, e retornando pra pagina inicial.

    //esse console log nao foi executado!!!
    console.log(2, data)
    return { data };
  } catch (error) {
    console.error(3, error)
    return { error: error };
  }
}
