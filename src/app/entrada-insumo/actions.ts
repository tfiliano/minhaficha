"use server";

import { createClient } from "@/utils/supabase";

export type IEntradaInsumo = {
  peso_bruto: number | null;
  data_recebimento: Date | string | null;
  fornecedor: string | null;
  nota_fiscal: string | null;
  sif: string | null;
  temperatura: string | null;
  lote: string | null;
  validade: Date | string | null;
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

export async function saveRecebimento(
  insertObject: any
): Promise<{ error?: any; data?: any[] }> {
  try {
    const supabase = createClient();
    console.log("objeto to save: ", insertObject);
    insertObject.data_recebimento = new Date(insertObject.data_recebimento!);
    insertObject.validade = new Date(insertObject.validade!);

    const { data, error } = await supabase
      .from("recebimentos")
      .insert(insertObject)
      .select();

    if (error) throw error;

    //preciso colocar um Loading, com feedback pro usuario saber se salvou ou nao, e retornando pra pagina inicial.

    //esse console log nao foi executado!!!
    console.log(2, data);
    return { data };
  } catch (error) {
    console.error(3, error);
    return { error: error };
  }
}
