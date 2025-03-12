"use server";

import { createClient } from "@/utils/supabase";
import type { Json } from "@/types/database.types";

export interface FieldPosition {
  name: string;
  x: number;
  y: number;
  fontSize: number;
  fontStyle: 'normal' | 'bold';
  reversed: boolean;
  alignment: 'left' | 'center' | 'right';
  fontFamily: string;
  fieldType: 'dynamic' | 'static' | 'qrcode' | 'barcode' | 'line';
  staticValue?: string;
  lineNumber: number;
  linePosition: number;
  defaultValue?: string;
  barcodeType?: 'code39' | 'code128' | 'ean13'; 
  barcodeHeight?: number;
  lineWidth?: number;
  lineHeight?: number;
}

export interface Template {
  id?: string;
  nome: string;
  zpl: string;
  campos: FieldPosition[];
  width: number;
  height: number;
  created_at?: string;
}

export async function saveTemplate(template: Template) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("templates_etiquetas")
    .upsert({
      id: template.id,
      nome: template.nome,
      zpl: template.zpl,
      campos: template.campos as unknown as Json,
      width: template.width,
      height: template.height
    }, {
      onConflict: 'id'
    });

  if (error) throw new Error(error.message);
  return data;
}

export async function getTemplates() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("templates_etiquetas")
    .select("*")
    .order("nome");

  if (error) throw new Error(error.message);
  
  // Debug dos dados brutos
  console.log("Dados brutos do banco:", JSON.stringify(data, null, 2));
  
  // Converter propriamente os dados JSON para o tipo Template
  const templates = (data || []).map(item => {
    try {
      // Garantir que campos é um array
      let campos: any[] = [];
      if (Array.isArray(item.campos)) {
        campos = item.campos;
      } else if (typeof item.campos === 'string') {
        try {
          campos = JSON.parse(item.campos);
        } catch (e) {
          console.error("Erro ao fazer parse dos campos:", e);
          campos = [];
        }
      }
      
      // Retornar um objeto Template com valores padrão para campos ausentes
      const template = {
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
      
      // Debug do template processado
      console.log(`Template ${item.id} processado:`, JSON.stringify(template, null, 2));
      
      return template;
    } catch (e) {
      console.error(`Erro ao processar template ${item.id}:`, e);
      // Retorna um template mínimo em caso de erro
      return {
        id: item.id,
        nome: item.nome || '[Erro ao carregar]',
        zpl: '',
        campos: [],
        width: 400,
        height: 300
      } as Template;
    }
  });
  
  return templates;
}

export async function testPrint(templateId: string, testData: Record<string, string>, currentZpl?: string) {
  const supabase = await createClient();
  let zpl: string;
  
  if (templateId === "temp" && currentZpl) {
    // For new templates that haven't been saved yet
    zpl = currentZpl;
  } else {
    // For existing templates
    const { data: template, error: templateError } = await supabase
      .from("templates_etiquetas")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError) throw new Error(templateError.message);
    zpl = template.zpl ?? '';
  }

  // Replace placeholders with test data
  Object.entries(testData).forEach(([key, value]) => {
    zpl = zpl.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  });

  // Create a test print job
  const { data, error } = await supabase
    .from("etiquetas")
    .insert({
      command: zpl,
      status: "pending",
      quantidade: 1,
      // test_print: true
    });

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("templates_etiquetas")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}
