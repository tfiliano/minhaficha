-- ============================================
-- TABELA DE CONVITES DE USUÁRIOS
-- ============================================

-- Criar ENUM para status do convite
DO $$ BEGIN
    CREATE TYPE public.INVITE_STATUS AS ENUM ('pending', 'accepted', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de convites
CREATE TABLE IF NOT EXISTS public.loja_convites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    tipo public.USER_TYPE NOT NULL DEFAULT 'user',
    status public.INVITE_STATUS NOT NULL DEFAULT 'pending',
    token TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES public.usuarios(id),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(loja_id, email, status)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_loja_convites_loja_id ON public.loja_convites(loja_id);
CREATE INDEX IF NOT EXISTS idx_loja_convites_email ON public.loja_convites(email);
CREATE INDEX IF NOT EXISTS idx_loja_convites_token ON public.loja_convites(token);
CREATE INDEX IF NOT EXISTS idx_loja_convites_status ON public.loja_convites(status);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_loja_convites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_loja_convites_updated_at ON public.loja_convites;
CREATE TRIGGER trigger_update_loja_convites_updated_at
    BEFORE UPDATE ON public.loja_convites
    FOR EACH ROW
    EXECUTE FUNCTION update_loja_convites_updated_at();

-- Comentários
COMMENT ON TABLE public.loja_convites IS 'Convites de usuários para acessar lojas';
COMMENT ON COLUMN public.loja_convites.token IS 'Token único para aceitar o convite';
COMMENT ON COLUMN public.loja_convites.expires_at IS 'Data de expiração do convite (7 dias após criação)';
