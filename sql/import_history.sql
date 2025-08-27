-- Tabela para armazenar histórico de importações
CREATE TABLE IF NOT EXISTS import_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL REFERENCES lojas(id),
  usuario_id UUID NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_path TEXT NOT NULL, -- caminho do arquivo no storage
  arquivo_size BIGINT NOT NULL,
  arquivo_mime_type TEXT NOT NULL,
  total_linhas INTEGER NOT NULL,
  linhas_processadas INTEGER NOT NULL,
  linhas_criadas INTEGER NOT NULL,
  linhas_atualizadas INTEGER NOT NULL,
  linhas_puladas INTEGER NOT NULL,
  linhas_com_erro INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed', -- 'processing', 'completed', 'failed'
  erros JSONB, -- array de erros encontrados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para armazenar detalhes de cada linha processada na importação
CREATE TABLE IF NOT EXISTS import_history_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  import_history_id UUID NOT NULL REFERENCES import_history(id) ON DELETE CASCADE,
  linha_numero INTEGER NOT NULL,
  produto_id UUID REFERENCES produtos(id),
  produto_codigo TEXT,
  produto_nome TEXT NOT NULL,
  acao TEXT NOT NULL, -- 'created', 'updated', 'skipped', 'error'
  dados_originais JSONB NOT NULL, -- dados como vieram do Excel
  dados_processados JSONB, -- dados após processamento
  erro_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_import_history_loja_id ON import_history(loja_id);
CREATE INDEX IF NOT EXISTS idx_import_history_created_at ON import_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_history_usuario_id ON import_history(usuario_id);

CREATE INDEX IF NOT EXISTS idx_import_history_details_import_id ON import_history_details(import_history_id);
CREATE INDEX IF NOT EXISTS idx_import_history_details_produto_id ON import_history_details(produto_id);

-- RLS (Row Level Security) - garantir acesso por loja
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history_details ENABLE ROW LEVEL SECURITY;

-- Policy para import_history
CREATE POLICY IF NOT EXISTS "Users can view import history from their store" ON import_history
  FOR SELECT USING (loja_id IN (SELECT loja_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY IF NOT EXISTS "Users can insert import history to their store" ON import_history
  FOR INSERT WITH CHECK (loja_id IN (SELECT loja_id FROM usuarios WHERE id = auth.uid()));

-- Policy para import_history_details
CREATE POLICY IF NOT EXISTS "Users can view import details from their store" ON import_history_details
  FOR SELECT USING (import_history_id IN (
    SELECT id FROM import_history WHERE loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
  ));

CREATE POLICY IF NOT EXISTS "Users can insert import details to their store" ON import_history_details
  FOR INSERT WITH CHECK (import_history_id IN (
    SELECT id FROM import_history WHERE loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
  ));