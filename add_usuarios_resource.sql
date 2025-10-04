-- ============================================
-- Adicionar recurso "usuarios" ao sistema de permissões
-- ============================================

-- 1. Adicionar recurso "usuarios"
INSERT INTO public.recursos (slug, nome, descricao) VALUES
    ('usuarios', 'Usuários', 'Gerenciamento de usuários da loja')
ON CONFLICT (slug) DO NOTHING;

-- 2. Criar permissões para o recurso "usuarios" (4 ações)
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
WHERE r.slug = 'usuarios'
ON CONFLICT (recurso_id, acao) DO NOTHING;

-- 3. Conceder permissões para MASTER (todas as permissões)
INSERT INTO public.role_permissoes (role, permissao_id)
SELECT
    'master'::public.USER_TYPE,
    p.id
FROM public.permissoes p
JOIN public.recursos r ON r.id = p.recurso_id
WHERE r.slug = 'usuarios'
ON CONFLICT (role, permissao_id, loja_id) DO NOTHING;

-- 4. Conceder permissões para ADMIN (todas as permissões de usuarios)
INSERT INTO public.role_permissoes (role, permissao_id)
SELECT
    'admin'::public.USER_TYPE,
    p.id
FROM public.permissoes p
JOIN public.recursos r ON r.id = p.recurso_id
WHERE r.slug = 'usuarios'
ON CONFLICT (role, permissao_id, loja_id) DO NOTHING;

-- 5. Conceder permissões para MANAGER (CRUD completo de usuarios)
INSERT INTO public.role_permissoes (role, permissao_id)
SELECT
    'manager'::public.USER_TYPE,
    p.id
FROM public.permissoes p
JOIN public.recursos r ON r.id = p.recurso_id
WHERE r.slug = 'usuarios'
ON CONFLICT (role, permissao_id, loja_id) DO NOTHING;

-- 6. Verificar permissões criadas
SELECT
    r.nome as recurso,
    p.acao,
    array_agg(rp.role::TEXT ORDER BY rp.role) as roles_com_acesso
FROM public.recursos r
JOIN public.permissoes p ON p.recurso_id = r.id
LEFT JOIN public.role_permissoes rp ON rp.permissao_id = p.id
WHERE r.slug = 'usuarios'
GROUP BY r.nome, p.acao
ORDER BY p.acao;
