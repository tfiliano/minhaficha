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
      
      // Prepare data to replace dynamic fields
      const data: Record<string, string> = {
        produto: obj.produto_nome || "",
        validade: obj.validade || "",
        lote: obj.lote || "",
        sif: obj.sif || obj.SIF || "",
        codigo: obj.produto_id || "", // Use product ID for QR code
      };

      // Add any other fields from object that might be used in the template
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          data[key] = String(value);
        }
      });

      // Replace all dynamic placeholders
      Object.entries(data).forEach(([key, value]) => {
        if (command) {
          // Replace all occurrences globally using RegExp
          command = command.replace(new RegExp(`\\{${key}\\}`, 'g'), value || "");
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

export interface FieldPosition {
  name: string;
  x: number;
  y: number;
  fontSize: number;
  fontStyle?: 'normal' | 'bold';
  reversed?: boolean;
  alignment?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fieldType?: 'dynamic' | 'static' | 'qrcode' | 'barcode' | 'line';
  staticValue?: string;
  lineNumber?: number;
  linePosition?: number;
  defaultValue?: string;
  barcodeType?: 'code39' | 'code128' | 'ean13';
  barcodeHeight?: number;
  lineWidth?: number;
  lineHeight?: number;
}

export interface Template {
  id: string;
  nome: string;
  zpl: string;
  campos: FieldPosition[];
  created_at: string;
  width?: number;
  height?: number;
}

export async function getTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates_etiquetas")
    .select("*")
    .order("nome");

  if (error) throw new Error(error.message);
  
  // Tratar os templates e converter de forma segura
  return (data || []).map(item => {
    // Usar tipagem 'any' de forma segura para campos
    const campos = item.campos as any[] || [];
    
    // Retornar um objeto Template com valores padrão para campos ausentes
    return {
      id: item.id,
      nome: item.nome || '',
      zpl: item.zpl || '',
      created_at: item.created_at,
      width: item.width || 400,
      height: item.height || 300,
      // Mapear os campos garantindo que todos tenham as propriedades esperadas
      campos: campos.map(campo => ({
        name: campo?.name || 'campo',
        x: typeof campo?.x === 'number' ? campo.x : 10,
        y: typeof campo?.y === 'number' ? campo.y : 10,
        fontSize: typeof campo?.fontSize === 'number' ? campo.fontSize : 10,
        fontStyle: campo?.fontStyle || 'normal',
        reversed: Boolean(campo?.reversed),
        alignment: campo?.alignment || 'left',
        fontFamily: campo?.fontFamily || 'A',
        fieldType: campo?.fieldType || 'dynamic',
        lineNumber: typeof campo?.lineNumber === 'number' ? campo.lineNumber : 1,
        linePosition: typeof campo?.linePosition === 'number' ? campo.linePosition : 1,
        staticValue: campo?.staticValue,
        defaultValue: campo?.defaultValue,
        barcodeType: campo?.barcodeType,
        barcodeHeight: campo?.barcodeHeight,
        lineWidth: campo?.lineWidth,
        lineHeight: campo?.lineHeight
      }))
    } as Template;
  });
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
