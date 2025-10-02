-- Script para verificar e corrigir permissões da tabela grupos

-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'grupos';

-- 2. Listar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'grupos';

-- 3. Desabilitar RLS temporariamente (CUIDADO: apenas para desenvolvimento)
-- ALTER TABLE grupos DISABLE ROW LEVEL SECURITY;

-- 4. OU criar políticas permissivas para desenvolvimento
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir tudo em grupos" ON grupos;

-- Criar política permissiva (ajustar em produção para ser mais restritiva)
CREATE POLICY "Permitir tudo em grupos"
ON grupos
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Verificar se a política foi criada
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'grupos';
