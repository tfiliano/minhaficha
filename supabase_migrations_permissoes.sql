-- ============================================
-- SISTEMA DE PERMISSÕES (RBAC)
-- Role-Based Access Control
-- ============================================

-- 1. Criar ENUM para tipos de usuário (se não existir)
DO $$ BEGIN
    CREATE TYPE public.USER_TYPE AS ENUM ('master', 'admin', 'manager', 'operator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Criar tabela de RECURSOS (módulos do sistema)
CREATE TABLE IF NOT EXISTS public.recursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    slug TEXT NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Criar ENUM para ações
DO $$ BEGIN
    CREATE TYPE public.PERMISSION_ACTION AS ENUM ('read', 'create', 'update', 'delete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Criar tabela de PERMISSÕES
CREATE TABLE IF NOT EXISTS public.permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurso_id UUID NOT NULL REFERENCES public.recursos(id) ON DELETE CASCADE,
    acao public.PERMISSION_ACTION NOT NULL,
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(recurso_id, acao)
);

-- 5. Criar tabela de ROLE_PERMISSÕES (associação entre roles e permissões)
CREATE TABLE IF NOT EXISTS public.role_permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.USER_TYPE NOT NULL,
    permissao_id UUID NOT NULL REFERENCES public.permissoes(id) ON DELETE CASCADE,
    loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role, permissao_id, loja_id)
);

-- ============================================
-- SEED: RECURSOS DO SISTEMA
-- ============================================

INSERT INTO public.recursos (slug, nome, descricao) VALUES
    ('produtos', 'Produtos', 'Gerenciamento de produtos e matérias-primas'),
    ('etiquetas', 'Etiquetas', 'Geração e gerenciamento de etiquetas'),
    ('relatorios', 'Relatórios', 'Visualização e exportação de relatórios'),
    ('ficha-tecnica', 'Ficha Técnica', 'Criação e edição de fichas técnicas'),
    ('operadores', 'Operadores', 'Gerenciamento de operadores'),
    ('grupos', 'Grupos', 'Gerenciamento de grupos de produtos'),
    ('setores', 'Setores', 'Gerenciamento de setores'),
    ('armazenamentos', 'Armazenamentos', 'Gerenciamento de locais de armazenamento'),
    ('fabricantes', 'Fabricantes', 'Gerenciamento de fabricantes'),
    ('sifs', 'SIFs', 'Gerenciamento de SIFs'),
    ('impressoras', 'Impressoras', 'Configuração de impressoras'),
    ('templates', 'Templates', 'Templates de etiquetas'),
    ('configuracoes', 'Configurações', 'Configurações do sistema'),
    ('producao', 'Produção', 'Operação de produção'),
    ('entrada-insumos', 'Entrada de Insumos', 'Operação de entrada de insumos')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED: PERMISSÕES (4 ações para cada recurso)
-- ============================================

INSERT INTO public.permissoes (recurso_id, acao, descricao)
SELECT
    r.id,
    a.acao,
    r.nome || ': ' ||
    CASE
        WHEN a.acao = 'read' THEN 'Visualizar'
        WHEN a.acao = 'create' THEN 'Criar'
        WHEN a.acao = 'update' THEN 'Editar'
        WHEN a.acao = 'delete' THEN 'Deletar'
    END
FROM
    public.recursos r
CROSS JOIN (
    VALUES
        ('read'::public.PERMISSION_ACTION),
        ('create'::public.PERMISSION_ACTION),
        ('update'::public.PERMISSION_ACTION),
        ('delete'::public.PERMISSION_ACTION)
) AS a(acao)
ON CONFLICT (recurso_id, acao) DO NOTHING;

-- ============================================
-- SEED: ROLE_PERMISSÕES PADRÃO
-- ============================================

-- MASTER: Todas as permissões
INSERT INTO public.role_permissoes (role, permissao_id)
SELECT
    'master'::public.USER_TYPE,
    p.id
FROM public.permissoes p
ON CONFLICT (role, permissao_id, loja_id) DO NOTHING;

-- ADMIN: Todas as permissões exceto configurações de sistema
INSERT INTO public.role_permissoes (role, permissao_id)
SELECT
    'admin'::public.USER_TYPE,
    p.id
FROM public.permissoes p
JOIN public.recursos r ON r.id = p.recurso_id
WHERE r.slug != 'configuracoes'
ON CONFLICT (role, permissao_id, loja_id) DO NOTHING;

-- MANAGER: CRUD completo de produtos, etiquetas, ficha técnica, grupos, setores, armazenamentos, fabricantes, sifs
-- Relatórios apenas leitura
INSERT INTO public.role_permissoes (role, permissao_id)
SELECT
    'manager'::public.USER_TYPE,
    p.id
FROM public.permissoes p
JOIN public.recursos r ON r.id = p.recurso_id
WHERE
    r.slug IN ('produtos', 'etiquetas', 'ficha-tecnica', 'grupos', 'setores', 'armazenamentos', 'fabricantes', 'sifs', 'templates', 'impressoras', 'operadores')
    OR (r.slug = 'relatorios' AND p.acao = 'read')
ON CONFLICT (role, permissao_id, loja_id) DO NOTHING;

-- OPERATOR: Apenas operação (produção, entrada de insumos, visualizar produtos e fichas técnicas)
INSERT INTO public.role_permissoes (role, permissao_id)
SELECT
    'operator'::public.USER_TYPE,
    p.id
FROM public.permissoes p
JOIN public.recursos r ON r.id = p.recurso_id
WHERE
    -- Operações completas
    (r.slug IN ('producao', 'entrada-insumos', 'etiquetas') AND p.acao IN ('read', 'create'))
    -- Apenas visualizar
    OR (r.slug IN ('produtos', 'ficha-tecnica') AND p.acao = 'read')
ON CONFLICT (role, permissao_id, loja_id) DO NOTHING;

-- USER: Apenas visualização de produtos e fichas técnicas
INSERT INTO public.role_permissoes (role, permissao_id)
SELECT
    'user'::public.USER_TYPE,
    p.id
FROM public.permissoes p
JOIN public.recursos r ON r.id = p.recurso_id
WHERE
    r.slug IN ('produtos', 'ficha-tecnica')
    AND p.acao = 'read'
ON CONFLICT (role, permissao_id, loja_id) DO NOTHING;

-- ============================================
-- FUNÇÃO: Verificar se usuário tem permissão
-- ============================================

CREATE OR REPLACE FUNCTION public.check_user_permission(
    p_user_id UUID,
    p_loja_id UUID,
    p_recurso_slug TEXT,
    p_acao public.PERMISSION_ACTION
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role public.USER_TYPE;
    v_has_permission BOOLEAN;
BEGIN
    -- Buscar o role do usuário na loja
    SELECT tipo INTO v_user_role
    FROM public.loja_usuarios
    WHERE user_id = p_user_id
        AND loja_id = p_loja_id
        AND ativo = true;

    -- Se não encontrou, retorna falso
    IF v_user_role IS NULL THEN
        RETURN false;
    END IF;

    -- Verificar se existe a permissão para o role
    SELECT EXISTS (
        SELECT 1
        FROM public.role_permissoes rp
        JOIN public.permissoes p ON p.id = rp.permissao_id
        JOIN public.recursos r ON r.id = p.recurso_id
        WHERE rp.role = v_user_role
            AND r.slug = p_recurso_slug
            AND p.acao = p_acao
            AND (rp.loja_id IS NULL OR rp.loja_id = p_loja_id)
    ) INTO v_has_permission;

    RETURN v_has_permission;
END;
$$;

-- ============================================
-- FUNÇÃO: Buscar todas as permissões do usuário
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_permissions(
    p_user_id UUID,
    p_loja_id UUID
)
RETURNS TABLE (
    recurso TEXT,
    acao TEXT,
    descricao TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role public.USER_TYPE;
BEGIN
    -- Buscar o role do usuário na loja
    SELECT tipo INTO v_user_role
    FROM public.loja_usuarios
    WHERE user_id = p_user_id
        AND loja_id = p_loja_id
        AND ativo = true;

    -- Se não encontrou, retorna vazio
    IF v_user_role IS NULL THEN
        RETURN;
    END IF;

    -- Retornar permissões
    RETURN QUERY
    SELECT
        r.slug::TEXT as recurso,
        p.acao::TEXT as acao,
        p.descricao::TEXT
    FROM public.role_permissoes rp
    JOIN public.permissoes p ON p.id = rp.permissao_id
    JOIN public.recursos r ON r.id = p.recurso_id
    WHERE rp.role = v_user_role
        AND (rp.loja_id IS NULL OR rp.loja_id = p_loja_id)
        AND r.ativo = true
    ORDER BY r.nome, p.acao;
END;
$$;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE public.recursos IS 'Recursos/módulos do sistema que podem ter permissões';
COMMENT ON TABLE public.permissoes IS 'Permissões (ações) disponíveis para cada recurso';
COMMENT ON TABLE public.role_permissoes IS 'Associação entre roles e permissões (RBAC)';
COMMENT ON FUNCTION public.check_user_permission IS 'Verifica se um usuário tem uma permissão específica';
COMMENT ON FUNCTION public.get_user_permissions IS 'Retorna todas as permissões de um usuário em uma loja';
