# Geração de Types do Supabase

## Comando para gerar types TypeScript

Quando o comando `pnpm generate:types` falhar com erro de autenticação, use:

```bash
export SUPABASE_ACCESS_TOKEN=sbp_5c8808e86ed89effb8ec7ad055e5c7886506ae1a && pnpm generate:types
```

## Onde está o token

O token está armazenado em `.env.local`:
- Variável: `SUPABASE_ACCESS_TOKEN`
- Valor atual: `sbp_5c8808e86ed89effb8ec7ad055e5c7886506ae1a`

## Script package.json

```json
"generate:types": "npx supabase gen types typescript --project-id 'hnhhoqjmydmdjkvqmidf' --schema public > src/types/database.types.ts"
```

## Quando usar

Execute esse comando sempre que:
1. Criar novas tabelas no Supabase
2. Adicionar/remover colunas em tabelas existentes
3. Modificar tipos de dados no banco
4. Criar/atualizar views ou enums

## Saída

O comando gera o arquivo `src/types/database.types.ts` com todos os tipos TypeScript do banco de dados.
