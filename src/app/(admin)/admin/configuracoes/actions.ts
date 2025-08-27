"use server";

import { createClient } from "@/utils/supabase";
import { revalidatePath } from "next/cache";

export interface LojaFormData {
  nome: string;
  codigo?: string;
  ativo?: boolean;
  configuracoes?: any;
}

export async function updateLoja(id: string, data: LojaFormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("lojas")
    .update({
      nome: data.nome,
      codigo: data.codigo,
      ativo: data.ativo,
      configuracoes: data.configuracoes,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/configuracoes");
  return { success: true };
}