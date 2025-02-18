"use server";

import { createClient } from "@/utils/supabase";

export interface PrintJob {
  id: string;
  created_at: string;
  status: string;
  command: string | null;
  impressora_id: string | null;
  quantidade: number | null;
  test_print: boolean | null;
  produto: {
    nome: string;
  } | null;
  impressora: {
    nome: string;
  } | null;
}

export async function getFilaImpressao() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("etiquetas")
    .select(`
      *,
      impressora:impressoras (
        nome
      ),
      produto:produtos (
        nome
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data as PrintJob[];
}

export async function retryPrint(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("etiquetas")
    .update({ status: "pending" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}

export async function cancelPrint(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("etiquetas")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}
