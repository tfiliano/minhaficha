-- Migration: Adicionar suporte a Fichas Técnicas
-- Data: 2025-10-02

-- 1. Adicionar campo item_de_cardapio à tabela produtos
ALTER TABLE produtos
ADD COLUMN IF NOT EXISTS item_de_cardapio BOOLEAN DEFAULT FALSE;

-- Adicionar comentário explicativo
COMMENT ON COLUMN produtos.item_de_cardapio IS 'Indica se o produto é um item de cardápio que possui ficha técnica';

-- 2. Criar tabela fichas_tecnicas
CREATE TABLE IF NOT EXISTS fichas_tecnicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
    produto_cardapio_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    nome TEXT, -- Nome da ficha técnica (pode ser diferente do produto)
    porcoes DECIMAL(10, 2), -- Quantidade de porções que a receita rende
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Garantir que cada produto de cardápio tenha apenas uma ficha técnica
    UNIQUE(produto_cardapio_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_loja_id ON fichas_tecnicas(loja_id);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_produto_cardapio_id ON fichas_tecnicas(produto_cardapio_id);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_ativo ON fichas_tecnicas(ativo);

-- Adicionar comentários
COMMENT ON TABLE fichas_tecnicas IS 'Fichas técnicas de produtos do cardápio';
COMMENT ON COLUMN fichas_tecnicas.produto_cardapio_id IS 'Produto do cardápio ao qual esta ficha técnica pertence';
COMMENT ON COLUMN fichas_tecnicas.porcoes IS 'Quantidade de porções que esta receita produz';

-- 3. Criar tabela fichas_tecnicas_itens (ingredientes)
CREATE TABLE IF NOT EXISTS fichas_tecnicas_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ficha_tecnica_id UUID NOT NULL REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
    produto_ingrediente_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    quantidade DECIMAL(10, 3) NOT NULL,
    unidade TEXT NOT NULL, -- UN, KG, G, ML, L, etc
    custo_unitario DECIMAL(10, 2), -- Custo por unidade no momento da adição
    ordem INTEGER DEFAULT 0, -- Para manter ordem dos ingredientes na receita
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Evitar ingredientes duplicados na mesma ficha
    UNIQUE(ficha_tecnica_id, produto_ingrediente_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_itens_ficha_id ON fichas_tecnicas_itens(ficha_tecnica_id);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_itens_produto_id ON fichas_tecnicas_itens(produto_ingrediente_id);

-- Adicionar comentários
COMMENT ON TABLE fichas_tecnicas_itens IS 'Ingredientes que compõem cada ficha técnica';
COMMENT ON COLUMN fichas_tecnicas_itens.quantidade IS 'Quantidade do ingrediente necessária';
COMMENT ON COLUMN fichas_tecnicas_itens.custo_unitario IS 'Custo unitário do ingrediente registrado no momento da adição';
COMMENT ON COLUMN fichas_tecnicas_itens.ordem IS 'Ordem de exibição do ingrediente na ficha técnica';

-- 4. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fichas_tecnicas_updated_at ON fichas_tecnicas;
CREATE TRIGGER update_fichas_tecnicas_updated_at
    BEFORE UPDATE ON fichas_tecnicas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_tecnicas_itens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para fichas_tecnicas (ajustar conforme sua autenticação)
DROP POLICY IF EXISTS "Usuários podem ver fichas técnicas da própria loja" ON fichas_tecnicas;
CREATE POLICY "Usuários podem ver fichas técnicas da própria loja"
    ON fichas_tecnicas FOR SELECT
    USING (TRUE); -- Ajustar conforme suas regras de autenticação

DROP POLICY IF EXISTS "Usuários podem inserir fichas técnicas na própria loja" ON fichas_tecnicas;
CREATE POLICY "Usuários podem inserir fichas técnicas na própria loja"
    ON fichas_tecnicas FOR INSERT
    WITH CHECK (TRUE); -- Ajustar conforme suas regras de autenticação

DROP POLICY IF EXISTS "Usuários podem atualizar fichas técnicas da própria loja" ON fichas_tecnicas;
CREATE POLICY "Usuários podem atualizar fichas técnicas da própria loja"
    ON fichas_tecnicas FOR UPDATE
    USING (TRUE); -- Ajustar conforme suas regras de autenticação

DROP POLICY IF EXISTS "Usuários podem deletar fichas técnicas da própria loja" ON fichas_tecnicas;
CREATE POLICY "Usuários podem deletar fichas técnicas da própria loja"
    ON fichas_tecnicas FOR DELETE
    USING (TRUE); -- Ajustar conforme suas regras de autenticação

-- Políticas RLS para fichas_tecnicas_itens
DROP POLICY IF EXISTS "Usuários podem ver itens de fichas técnicas" ON fichas_tecnicas_itens;
CREATE POLICY "Usuários podem ver itens de fichas técnicas"
    ON fichas_tecnicas_itens FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Usuários podem inserir itens em fichas técnicas" ON fichas_tecnicas_itens;
CREATE POLICY "Usuários podem inserir itens em fichas técnicas"
    ON fichas_tecnicas_itens FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Usuários podem atualizar itens de fichas técnicas" ON fichas_tecnicas_itens;
CREATE POLICY "Usuários podem atualizar itens de fichas técnicas"
    ON fichas_tecnicas_itens FOR UPDATE
    USING (TRUE);

DROP POLICY IF EXISTS "Usuários podem deletar itens de fichas técnicas" ON fichas_tecnicas_itens;
CREATE POLICY "Usuários podem deletar itens de fichas técnicas"
    ON fichas_tecnicas_itens FOR DELETE
    USING (TRUE);

-- 6. Criar view para facilitar consultas (opcional)
CREATE OR REPLACE VIEW vw_fichas_tecnicas_completas AS
SELECT
    ft.id as ficha_id,
    ft.loja_id,
    ft.nome as ficha_nome,
    ft.porcoes,
    ft.observacoes as ficha_observacoes,
    ft.ativo,
    ft.created_at,
    ft.updated_at,
    p.id as produto_id,
    p.codigo as produto_codigo,
    p.nome as produto_nome,
    COUNT(fti.id) as total_ingredientes,
    SUM(fti.quantidade * COALESCE(fti.custo_unitario, 0)) as custo_total_estimado
FROM fichas_tecnicas ft
INNER JOIN produtos p ON ft.produto_cardapio_id = p.id
LEFT JOIN fichas_tecnicas_itens fti ON ft.id = fti.ficha_tecnica_id
GROUP BY ft.id, ft.loja_id, ft.nome, ft.porcoes, ft.observacoes, ft.ativo,
         ft.created_at, ft.updated_at, p.id, p.codigo, p.nome;

COMMENT ON VIEW vw_fichas_tecnicas_completas IS 'View com informações consolidadas das fichas técnicas';
