"use server";

import { createClient } from "@/utils/supabase";

interface EtiquetaData {
  template_id?: string;
  produto_nome?: string;
  validade?: string;
  lote?: string;
  SIF?: string;
  conformidade_embalagem?: string;
  conformidade_produtos?: string;
  conformidade_transporte?: string;
  data_recebimento?: string;
  fornecedor?: string;
  nota_fiscal?: string;
  observacoes?: string;
  peso_bruto?: number;
  produto?: string;
  sif?: string;
  temperatura?: string;
  impressora_id?: string;
  quantidade?: number;
  [key: string]: any;
}

export async function gerarEtiqueta(obj: EtiquetaData) {
  const supabase = await createClient();

  // Get the template if specified
  let command: string | null = null;
  if (obj.template_id) {
    const { data: template } = await supabase
      .from("templates_etiquetas")
      .select("*")
      .eq("id", obj.template_id)
      .single();

    if (template) {
      // Replace placeholders in ZPL
      command = template.zpl;
      const data = {
        produto: obj.produto_nome,
        validade: obj.validade,
        lote: obj.lote,
        sif: obj.SIF,
      };

      Object.entries(data).forEach(([key, value]) => {
        if (command) {
          command = command.replace(`{${key}}`, value || "");
        }
      });
    }
  }

  // Remove unnecessary fields
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
  delete obj.template_id;

  // Set status as pending for the print service to pick up
  obj.status = "pending";
  if (command) {
    obj.command = command;
  }

  const { data, error } = await supabase.from("etiquetas").insert(obj);
  if (error) throw new Error(error.message);
  return data;
}

export interface Template {
  id: string;
  nome: string;
  zpl: string;
  campos: any;
  created_at: string;
}

export async function getTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates_etiquetas")
    .select("*")
    .order("nome");

  if (error) throw new Error(error.message);
  return data as Template[];
}

export interface Impressora {
  id: string;
  nome: string;
}

export async function getImpressoras() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("impressoras")
    .select("id, nome")
    .order("nome");

  if (error) throw new Error(error.message);
  return data as Impressora[];
}
