"use server";

import { createClient } from "@/utils/supabase";

interface FieldPosition {
  name: string;
  x: number;
  y: number;
  fontSize: number;
  fontStyle: 'normal' | 'bold';
  reversed: boolean;
  alignment: 'left' | 'center' | 'right';
  fontFamily: string;
}

interface TemplateData {
  id?: string;
  name: string;
  zpl: string;
  fields: FieldPosition[];
  width: number;
  height: number;
}

export async function saveTemplate(template: TemplateData) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("templates_etiquetas")
    .upsert({
      id: template.id,
      nome: template.name,
      zpl: template.zpl,
      campos: template.fields,
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

    console.log(data, error)
  if (error) throw new Error(error.message);
  return data;
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
    zpl = template.zpl;
  }

  // Replace placeholders with test data
  Object.entries(testData).forEach(([key, value]) => {
    zpl = zpl.replace(`{${key}}`, value);
  });

  // Create a test print job
  const { data, error } = await supabase
    .from("etiquetas")
    .insert({
      command: zpl,
      status: "pending",
      quantidade: 1,
      test_print: true
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
