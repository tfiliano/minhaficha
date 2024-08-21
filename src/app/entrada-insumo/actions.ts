"use server";

import { createClient } from "@/utils/supabase";

export type IEntradaInsumo = {
  peso_bruto: number | null,
  data_recebimento: Date | null,
  fornecedor: string | null;
  nota_fiscal: string | null;
  sif: string | null;
  temperatura: string | null;
  lote: string | null;
  validade: string | null;
  conformidade_transporte: string | null;
  conformidade_embalagem: string | null;
  conformidade_produtos: string | null;
  observacoes: string | null;

  produto_nome?: string | null;
  produto_id?: string | null;
  produto?: string | null;
  setor?: string | null;
  operador?: string | null;
  operador_id?: string | null;
};

export async function saveProducao(producao: IEntradaInsumo) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("producao").insert(producao);
    if (error) {
      console.error(1, error)
      return { error: error };
    }
    
    //preciso colocar um Loading, com feedback pro usuario saber se salvou ou nao, e retornando pra pagina inicial.

    //esse console log nao foi executado!!!
    console.log(2, data)
    return data;
  } catch (error) {
    console.error(3, error)
    return { error: error };
  }
}
