"use server";

import { createClient } from "@/utils/supabase";

export async function createImportTables() {
  try {
    const supabase = await createClient();

    // Primeiro, vamos tentar inserir dados de teste para ver se as tabelas existem
    const { error: testError } = await supabase
      .from('import_history')
      .select('id')
      .limit(1);

    if (testError?.code === '42P01') {
      // Tabelas não existem, vamos retornar instruções para criar manualmente
      const sqlInstructions = `
-- Execute este SQL no painel do Supabase (SQL Editor):

-- Tabela para histórico de importações
CREATE TABLE import_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_path TEXT NOT NULL,
  arquivo_size BIGINT NOT NULL,
  arquivo_mime_type TEXT NOT NULL,
  total_linhas INTEGER NOT NULL,
  linhas_processadas INTEGER NOT NULL,
  linhas_criadas INTEGER NOT NULL,
  linhas_atualizadas INTEGER NOT NULL,
  linhas_puladas INTEGER NOT NULL,
  linhas_com_erro INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  erros JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para detalhes das importações
CREATE TABLE import_history_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  import_history_id UUID NOT NULL REFERENCES import_history(id) ON DELETE CASCADE,
  linha_numero INTEGER NOT NULL,
  produto_id UUID,
  produto_codigo TEXT,
  produto_nome TEXT NOT NULL,
  acao TEXT NOT NULL,
  dados_originais JSONB NOT NULL,
  dados_processados JSONB,
  erro_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_import_history_loja_id ON import_history(loja_id);
CREATE INDEX idx_import_history_created_at ON import_history(created_at DESC);
CREATE INDEX idx_import_history_usuario_id ON import_history(usuario_id);
CREATE INDEX idx_import_history_details_import_id ON import_history_details(import_history_id);

-- RLS (Row Level Security)
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history_details ENABLE ROW LEVEL SECURITY;

-- Policies para import_history
CREATE POLICY "Users can view import history from their store" ON import_history
  FOR SELECT USING (loja_id IN (
    SELECT loja_id FROM usuarios WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert import history to their store" ON import_history
  FOR INSERT WITH CHECK (loja_id IN (
    SELECT loja_id FROM usuarios WHERE id = auth.uid()
  ));

-- Policies para import_history_details  
CREATE POLICY "Users can view import details from their store" ON import_history_details
  FOR SELECT USING (import_history_id IN (
    SELECT id FROM import_history WHERE loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert import details to their store" ON import_history_details
  FOR INSERT WITH CHECK (import_history_id IN (
    SELECT id FROM import_history WHERE loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
  ));
      `.trim();

      return {
        success: false,
        error: 'MANUAL_SQL_REQUIRED',
        sqlInstructions
      };
    }

    // Se chegou aqui, as tabelas já existem
    return { success: true, message: 'Tabelas já existem e estão prontas para uso!' };

  } catch (error) {
    console.error('Erro geral:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}