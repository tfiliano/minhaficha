"use server";

import { createClient } from "@/utils/supabase";

export type ILocalArmazenamento = {
  id?: string | null;
  armazenamento: string | null;
  created_at?: string | null;
};

export async function saveLocalArmazenamento(
  insertObject: ILocalArmazenamento
): Promise<{ error?: any; data?: any[] }> {
  try {
    const supabase = createClient();
    console.log("objeto to save: ", insertObject);
    // insertObject.data_recebimento = new Date(insertObject.data_recebimento!);
    // insertObject.validade = new Date(insertObject.validade!);

    const { data, error } = await supabase
      .from("locais_armazenamento")
      .insert(insertObject)
      .select();

    if (error) throw error;

    console.log(2, data);
    return { data };
  } catch (error) {
    console.error(3, error);
    return { error: error };
  }
}

export async function updateLocalArmazenamento(
  armazenamentoObject: ILocalArmazenamento
): Promise<{ error?: any; data?: any[] }> {
  try {
    const supabase = createClient();
    console.log("objeto to update: ", armazenamentoObject);

    const { data, error } = await supabase
      .from("locais_armazenamento")
      .update(armazenamentoObject)
      .select()
      .single();

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error(3, error);
    return { error: error };
  }
}
