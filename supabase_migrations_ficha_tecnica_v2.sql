-- Migration: Adicionar Modo de Preparo e Fotos às Fichas Técnicas
-- Data: 2025-10-02

-- 1. Adicionar novos campos à tabela fichas_tecnicas
ALTER TABLE fichas_tecnicas
ADD COLUMN IF NOT EXISTS modo_preparo TEXT,
ADD COLUMN IF NOT EXISTS tempo_preparo_minutos INTEGER;

-- Adicionar comentários explicativos
COMMENT ON COLUMN fichas_tecnicas.modo_preparo IS 'Instruções passo a passo para preparar o item do cardápio';
COMMENT ON COLUMN fichas_tecnicas.tempo_preparo_minutos IS 'Tempo estimado de preparo em minutos';

-- 2. Criar tabela fichas_tecnicas_fotos
CREATE TABLE IF NOT EXISTS fichas_tecnicas_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ficha_tecnica_id UUID NOT NULL REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
    url TEXT NOT NULL, -- URL da foto no Supabase Storage
    is_capa BOOLEAN DEFAULT FALSE, -- Indica se é a foto de capa
    ordem INTEGER DEFAULT 0, -- Ordem de exibição da foto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_fotos_ficha_id ON fichas_tecnicas_fotos(ficha_tecnica_id);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_fotos_is_capa ON fichas_tecnicas_fotos(is_capa);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_fotos_ordem ON fichas_tecnicas_fotos(ordem);

-- Índice único parcial: garantir apenas uma foto de capa por ficha técnica
CREATE UNIQUE INDEX IF NOT EXISTS idx_fichas_tecnicas_fotos_unique_capa
ON fichas_tecnicas_fotos(ficha_tecnica_id)
WHERE is_capa = TRUE;

-- Adicionar comentários
COMMENT ON TABLE fichas_tecnicas_fotos IS 'Fotos associadas às fichas técnicas';
COMMENT ON COLUMN fichas_tecnicas_fotos.url IS 'URL da foto no Supabase Storage';
COMMENT ON COLUMN fichas_tecnicas_fotos.is_capa IS 'Indica se é a foto de capa da ficha técnica';
COMMENT ON COLUMN fichas_tecnicas_fotos.ordem IS 'Ordem de exibição da foto (0 = primeira)';

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE fichas_tecnicas_fotos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para fichas_tecnicas_fotos
DROP POLICY IF EXISTS "Usuários podem ver fotos de fichas técnicas" ON fichas_tecnicas_fotos;
CREATE POLICY "Usuários podem ver fotos de fichas técnicas"
    ON fichas_tecnicas_fotos FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Usuários podem inserir fotos em fichas técnicas" ON fichas_tecnicas_fotos;
CREATE POLICY "Usuários podem inserir fotos em fichas técnicas"
    ON fichas_tecnicas_fotos FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Usuários podem atualizar fotos de fichas técnicas" ON fichas_tecnicas_fotos;
CREATE POLICY "Usuários podem atualizar fotos de fichas técnicas"
    ON fichas_tecnicas_fotos FOR UPDATE
    USING (TRUE);

DROP POLICY IF EXISTS "Usuários podem deletar fotos de fichas técnicas" ON fichas_tecnicas_fotos;
CREATE POLICY "Usuários podem deletar fotos de fichas técnicas"
    ON fichas_tecnicas_fotos FOR DELETE
    USING (TRUE);

-- 4. Criar trigger para garantir apenas uma foto de capa por ficha
CREATE OR REPLACE FUNCTION garantir_uma_foto_capa()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a nova foto está sendo marcada como capa
    IF NEW.is_capa = TRUE THEN
        -- Desmarcar outras fotos como capa da mesma ficha técnica
        UPDATE fichas_tecnicas_fotos
        SET is_capa = FALSE
        WHERE ficha_tecnica_id = NEW.ficha_tecnica_id
          AND id != NEW.id
          AND is_capa = TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_garantir_uma_foto_capa ON fichas_tecnicas_fotos;
CREATE TRIGGER trigger_garantir_uma_foto_capa
    BEFORE INSERT OR UPDATE ON fichas_tecnicas_fotos
    FOR EACH ROW
    EXECUTE FUNCTION garantir_uma_foto_capa();

-- 5. Atualizar view para incluir informações de fotos
DROP VIEW IF EXISTS vw_fichas_tecnicas_completas;
CREATE OR REPLACE VIEW vw_fichas_tecnicas_completas AS
SELECT
    ft.id as ficha_id,
    ft.loja_id,
    ft.nome as ficha_nome,
    ft.porcoes,
    ft.observacoes as ficha_observacoes,
    ft.modo_preparo,
    ft.tempo_preparo_minutos,
    ft.ativo,
    ft.created_at,
    ft.updated_at,
    p.id as produto_id,
    p.codigo as produto_codigo,
    p.nome as produto_nome,
    COUNT(DISTINCT fti.id) as total_ingredientes,
    SUM(fti.quantidade * COALESCE(fti.custo_unitario, 0)) as custo_total_estimado,
    COUNT(DISTINCT ftf.id) as total_fotos,
    (SELECT url FROM fichas_tecnicas_fotos
     WHERE ficha_tecnica_id = ft.id AND is_capa = TRUE
     LIMIT 1) as foto_capa_url
FROM fichas_tecnicas ft
INNER JOIN produtos p ON ft.produto_cardapio_id = p.id
LEFT JOIN fichas_tecnicas_itens fti ON ft.id = fti.ficha_tecnica_id
LEFT JOIN fichas_tecnicas_fotos ftf ON ft.id = ftf.ficha_tecnica_id
GROUP BY ft.id, ft.loja_id, ft.nome, ft.porcoes, ft.observacoes, ft.modo_preparo,
         ft.tempo_preparo_minutos, ft.ativo, ft.created_at, ft.updated_at,
         p.id, p.codigo, p.nome;

COMMENT ON VIEW vw_fichas_tecnicas_completas IS 'View com informações consolidadas das fichas técnicas incluindo fotos';
