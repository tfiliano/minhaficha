-- ============================================
-- Script para garantir permissões de MASTER
-- para o usuário thiago@centresolucoes.com.br
-- ============================================

-- 1. Encontrar o ID do usuário pelo email
DO $$
DECLARE
    v_user_id UUID;
    v_loja_record RECORD;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO v_user_id
    FROM public.usuarios
    WHERE email = 'thiago@centresolucoes.com.br';

    -- Se não encontrou o usuário, exibir erro
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'ERRO: Usuário com email thiago@centresolucoes.com.br não encontrado!';
        RAISE NOTICE 'Por favor, verifique se o email está correto ou se o usuário já foi criado.';
        RETURN;
    END IF;

    RAISE NOTICE 'Usuário encontrado: %', v_user_id;

    -- Atualizar tipo do usuário para master na tabela usuarios
    UPDATE public.usuarios
    SET type = 'master'
    WHERE id = v_user_id;

    RAISE NOTICE 'Tipo do usuário atualizado para MASTER na tabela usuarios';

    -- Adicionar o usuário à tabela usuarios_masters (se não existir)
    INSERT INTO public.usuarios_masters (id, is_active)
    VALUES (v_user_id, true)
    ON CONFLICT (id)
    DO UPDATE SET is_active = true;

    RAISE NOTICE 'Usuário adicionado/atualizado na tabela usuarios_masters';

    -- Para cada loja existente, garantir que o usuário tenha acesso como MASTER
    FOR v_loja_record IN
        SELECT id FROM public.lojas
    LOOP
        -- Tentar atualizar primeiro
        UPDATE public.loja_usuarios
        SET tipo = 'master', ativo = true
        WHERE user_id = v_user_id AND loja_id = v_loja_record.id;

        -- Se não atualizou nenhuma linha, inserir
        IF NOT FOUND THEN
            INSERT INTO public.loja_usuarios (user_id, loja_id, tipo, ativo)
            VALUES (v_user_id, v_loja_record.id, 'master', true);
        END IF;

        RAISE NOTICE 'Permissões atualizadas para loja: %', v_loja_record.id;
    END LOOP;

    RAISE NOTICE '✅ Processo concluído com sucesso!';
    RAISE NOTICE 'Usuário thiago@centresolucoes.com.br agora tem permissões de MASTER em todas as lojas';

END $$;

-- Verificar resultado
SELECT
    u.email,
    u.type as tipo_usuario,
    um.is_active as master_ativo,
    COUNT(DISTINCT lu.loja_id) as total_lojas_com_acesso
FROM public.usuarios u
LEFT JOIN public.usuarios_masters um ON um.id = u.id
LEFT JOIN public.loja_usuarios lu ON lu.user_id = u.id
WHERE u.email = 'thiago@centresolucoes.com.br'
GROUP BY u.email, u.type, um.is_active;

-- Listar lojas e permissões
SELECT
    l.nome as loja,
    lu.tipo as role,
    lu.ativo
FROM public.loja_usuarios lu
JOIN public.lojas l ON l.id = lu.loja_id
JOIN public.usuarios u ON u.id = lu.user_id
WHERE u.email = 'thiago@centresolucoes.com.br'
ORDER BY l.nome;
