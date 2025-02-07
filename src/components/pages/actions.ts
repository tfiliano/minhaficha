"use server";

import { createClient } from "@/utils/supabase";

export async function gerarEtiqueta(obj: any) {
  const supabase = await createClient();
  delete obj.conformidade_embalagem;
  delete obj.conformidade_produtos;
  delete obj.conformidade_transporte;
  delete obj.data_recebimento;
  delete obj.fornecedor;
  delete obj.nota_fiscal;
  delete obj.observacoes;
  delete obj.peso_bruto;
  delete obj.produto;
  delete obj.sif;
  delete obj.temperatura;
  const { data, error } = await supabase.from("etiquetas").insert(obj);
  if (error) throw new Error(error.message);
  return data;
}
