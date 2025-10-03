# Sistema de Permissões (RBAC)

Sistema de controle de permissões baseado em funções (Role-Based Access Control) implementado no MinhaFicha.

## Estrutura

### Tabelas

1. **recursos** - Módulos/recursos do sistema
2. **permissoes** - Ações disponíveis para cada recurso
3. **role_permissoes** - Associação entre funções e permissões

### Funções (Roles)

- **master**: Acesso total ao sistema
- **admin**: Acesso total exceto configurações de sistema
- **manager**: CRUD de produtos, etiquetas, fichas técnicas; visualização de relatórios
- **operator**: Operações de produção e entrada de insumos
- **user**: Apenas visualização de produtos e fichas técnicas

### Recursos

- produtos
- etiquetas
- relatorios
- ficha-tecnica
- operadores
- grupos
- setores
- armazenamentos
- fabricantes
- sifs
- impressoras
- templates
- configuracoes
- producao
- entrada-insumos

### Ações

- **read**: Visualizar
- **create**: Criar
- **update**: Editar
- **delete**: Deletar

## Instalação

### 1. Executar Migração SQL

Execute o arquivo `supabase_migrations_permissoes.sql` no SQL Editor do Supabase:

```bash
# Copie o conteúdo do arquivo e cole no SQL Editor do Supabase
```

Ou use a CLI do Supabase:

```bash
supabase db reset
```

### 2. Regenerar Types

Após executar a migração, regenere os types do TypeScript:

```bash
pnpm generate:types
```

## Uso

### Server-side (Server Actions, API Routes)

```typescript
import { hasPermission, canCreate, canUpdate } from "@/lib/permissions";

// Verificar uma permissão específica
const canEdit = await hasPermission(userId, lojaId, "produtos", "update");

// Usar helpers
const canCreateProduct = await canCreate(userId, lojaId, "produtos");
const canUpdateProduct = await canUpdate(userId, lojaId, "produtos");

// Buscar todas as permissões do usuário
import { getUserPermissions } from "@/lib/permissions";
const permissions = await getUserPermissions(userId, lojaId);
```

### Client-side (Componentes React)

#### Hook usePermissions

```typescript
import { usePermissions } from "@/hooks/use-permissions";

function MyComponent() {
  const { canCreate, canUpdate, canDelete, loading } = usePermissions();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {canCreate("produtos") && <Button>Criar Produto</Button>}
      {canUpdate("produtos") && <Button>Editar Produto</Button>}
      {canDelete("produtos") && <Button>Deletar Produto</Button>}
    </div>
  );
}
```

#### Hook useCanAccess

```typescript
import { useCanAccess } from "@/hooks/use-permissions";

function MyComponent() {
  const canEdit = useCanAccess("produtos", "update");

  return canEdit ? <Button>Editar</Button> : null;
}
```

#### Hook useResourcePermissions

```typescript
import { useResourcePermissions } from "@/hooks/use-permissions";

function ProductPage() {
  const { canRead, canCreate, canUpdate, canDelete, loading } = useResourcePermissions("produtos");

  if (loading) return <div>Carregando...</div>;
  if (!canRead) return <div>Sem acesso</div>;

  return (
    <div>
      {canCreate && <Button>Novo Produto</Button>}
      {/* ... */}
    </div>
  );
}
```

### Componente ProtectedAction

Renderiza children apenas se usuário tiver a permissão:

```tsx
import { ProtectedAction } from "@/components/auth/protected-action";

<ProtectedAction resource="produtos" action="create">
  <Button>Criar Produto</Button>
</ProtectedAction>

// Com fallback
<ProtectedAction
  resource="produtos"
  action="delete"
  fallback={<span>Sem permissão</span>}
>
  <Button variant="destructive">Deletar</Button>
</ProtectedAction>

// Ocultar se não tiver permissão
<ProtectedAction
  resource="produtos"
  action="create"
  hideIfUnauthorized
>
  <Button>Criar Produto</Button>
</ProtectedAction>
```

### Componente ProtectedRoute

Protege páginas inteiras:

```tsx
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ProdutosPage() {
  return (
    <ProtectedRoute resource="produtos">
      <div>Conteúdo da página de produtos</div>
    </ProtectedRoute>
  );
}

// Requer permissão de criar
<ProtectedRoute resource="produtos" requireCreate>
  <FormCriarProduto />
</ProtectedRoute>

// Múltiplas permissões
<ProtectedRoute
  resource="produtos"
  requireCreate
  requireUpdate
  requireDelete
>
  <AdminPanel />
</ProtectedRoute>
```

## Permissões Padrão por Role

### Master
- ✅ Todas as permissões

### Admin
- ✅ Produtos (CRUD)
- ✅ Etiquetas (CRUD)
- ✅ Relatórios (CRUD)
- ✅ Ficha Técnica (CRUD)
- ✅ Operadores (CRUD)
- ✅ Grupos, Setores, Armazenamentos, Fabricantes, SIFs (CRUD)
- ✅ Templates, Impressoras (CRUD)
- ❌ Configurações

### Manager
- ✅ Produtos (CRUD)
- ✅ Etiquetas (CRUD)
- ✅ Ficha Técnica (CRUD)
- ✅ Grupos, Setores, Armazenamentos, Fabricantes, SIFs (CRUD)
- ✅ Templates, Impressoras (CRUD)
- ✅ Operadores (CRUD)
- ✅ Relatórios (apenas leitura)

### Operator
- ✅ Produção (ler e criar)
- ✅ Entrada de Insumos (ler e criar)
- ✅ Etiquetas (ler e criar)
- ✅ Produtos (apenas leitura)
- ✅ Ficha Técnica (apenas leitura)

### User
- ✅ Produtos (apenas leitura)
- ✅ Ficha Técnica (apenas leitura)

## Customização

Para alterar as permissões padrão de uma role, edite a migração SQL ou execute:

```sql
-- Remover permissão
DELETE FROM role_permissoes
WHERE role = 'manager'
AND permissao_id IN (
  SELECT p.id FROM permissoes p
  JOIN recursos r ON r.id = p.recurso_id
  WHERE r.slug = 'relatorios' AND p.acao = 'create'
);

-- Adicionar permissão
INSERT INTO role_permissoes (role, permissao_id)
SELECT 'operator', p.id
FROM permissoes p
JOIN recursos r ON r.id = p.recurso_id
WHERE r.slug = 'produtos' AND p.acao = 'update';
```

## Funções SQL Disponíveis

### check_user_permission

Verifica se usuário tem uma permissão:

```sql
SELECT check_user_permission(
  'user-uuid',
  'loja-uuid',
  'produtos',
  'create'
);
```

### get_user_permissions

Retorna todas as permissões do usuário:

```sql
SELECT * FROM get_user_permissions(
  'user-uuid',
  'loja-uuid'
);
```

## Próximos Passos

1. ✅ Executar migração SQL
2. ✅ Regenerar types
3. ⏳ Criar interface de gerenciamento de permissões
4. ⏳ Atualizar middleware para verificar permissões
5. ⏳ Proteger rotas e ações existentes

## Notas

- As permissões são verificadas em tempo real
- Alterações nas permissões requerem reload da página para refletir no client
- Use `reload()` do hook `usePermissions` para atualizar permissões manualmente
