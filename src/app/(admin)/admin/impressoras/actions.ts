"use server";

import { createClient } from "@/utils/supabase";

export interface Printer {
  id: string;
  nome: string;
  ip: string;
  porta: number;
  status: 'online' | 'offline';
  created_at: string;
}

export async function getPrinters() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("impressoras")
    .select("*")
    .order("nome");

  if (error) throw new Error(error.message);
  return data as Printer[];
}

export async function savePrinter(printer: Omit<Printer, 'id' | 'created_at'>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("impressoras")
    .insert({
      nome: printer.nome,
      ip: printer.ip,
      porta: printer.porta || 9100,
      status: printer.status || 'offline'
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updatePrinter(id: string, printer: Partial<Printer>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("impressoras")
    .update(printer)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deletePrinter(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("impressoras")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}

export async function testPrinter(id: string) {
  const supabase = await createClient();
  
  // Get printer details
  const { data: printer, error: printerError } = await supabase
    .from("impressoras")
    .select("*")
    .eq("id", id)
    .single();

  if (printerError) throw new Error(printerError.message);

  // Create a test print job
  const { error } = await supabase
    .from("etiquetas")
    .insert({
      command: "^XA^FO50,50^ADN,36,20^FDPrinter Test^FS^XZ",
      status: "pending",
      impressora_id: id,
      quantidade: 1,
      test_print: true
    });

  if (error) throw new Error(error.message);
  return true;
}
