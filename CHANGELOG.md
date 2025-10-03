# Changelog

## [Unreleased] - 2025-10-03

### 🎨 Sistema de Geração Profissional de PDFs para Fichas Técnicas

#### **Nova Funcionalidade: Exportação de PDF com Puppeteer**
- **📄 Geração de PDF Profissional**: Sistema completo de geração de PDFs usando Puppeteer
  - API Route: `/api/ficha-tecnica/[id]/pdf`
  - HTML otimizado com design moderno e profissional
  - Fonte Inter para tipografia elegante
  - Layout responsivo em A4 com 2 páginas

#### **🎯 Design Premium do PDF**
- **Cabeçalho com gradiente verde**: Badge com código do produto
- **Card de informações**: Grid com preparação, categoria e foto do prato
- **Tabela moderna de ingredientes**:
  - 6 colunas compactas (Ingrediente, UN, Qtd., F.C., Valor Unit., Valor Total)
  - Badge mostrando quantidade de itens
  - Linha de total destacada com fundo gradiente
- **Modo de preparo**: Formatação rica respeitada (listas, negrito, itálico)
- **Cards de estatísticas**: Rendimento, Custo Total e Custo/Porção

#### **🔄 Melhorias no Sistema de Fichas Técnicas**
- **Botão "Visualizar PDF"** em cada card da lista
- **Preview em tela**: Design idêntico ao PDF gerado
- **Botão de produtos sem ficha**: Mostra todos os produtos de cardápio que ainda não têm ficha técnica
- **Otimização de fontes e espaçamentos**: Layout compacto e profissional

#### **🛠️ Dependências**
- Adicionado: `puppeteer@24.23.0` para geração de PDFs

#### **📦 Arquivos Modificados**
- `/src/app/api/ficha-tecnica/[id]/pdf/route.ts` (criado)
- `/src/app/(app)/ficha-tecnica/[id]/preview/page.tsx` (criado)
- `/src/components/ficha-tecnica/ficha-tecnica-pdf-preview.tsx` (criado)
- `/src/components/ficha-tecnica/ficha-tecnica-list.tsx`
- `/src/components/ficha-tecnica/produto-cardapio-selector.tsx`
- `/src/app/(app)/ficha-tecnica/actions.ts`
- `/src/app/(app)/ficha-tecnica/page.tsx`

---

## [Previous] - 2025-10-02

### ✨ Sistema de Filtros Avançados com FilterSheet

#### **Novos Componentes e Hooks**
- **📦 Hook `useFilters`**: Hook reutilizável para gerenciamento de estado de filtros
  - Localização: `/src/hooks/use-filters.ts`
  - Gerencia filtros de forma genérica e type-safe
  - Conta automaticamente filtros ativos
  - Função `clearFilters` para limpar todos os filtros

- **🎯 Componente `FilterSheet`**: Sheet lateral com animação suave
  - Localização: `/src/components/ui/filter-sheet.tsx`
  - Desliza da direita (responsivo - bottom no mobile)
  - Badge mostrando quantidade de filtros ativos
  - Botões "Limpar" e "Aplicar" no footer
  - Scroll suave para muitos filtros

#### **🔄 Refatoração de 7 Páginas Administrativas**
Todas as páginas de listagem administrativas foram padronizadas:

- **Produtos** (`/admin/produtos`)
  - Filtros: busca, grupo, armazenamento, produto pai, status
  - Badge contador: Package (azul)

- **Operadores** (`/admin/operadores`)
  - Filtros: busca, status (ativos/inativos)
  - Badge contador: UserCheck (cyan)

- **Grupos** (`/admin/grupos`)
  - Filtros: busca
  - Badge contador: Layers (purple)

- **Setores** (`/admin/setores`)
  - Filtros: busca
  - Badge contador: Users (indigo)

- **Armazenamentos** (`/admin/armazenamentos`)
  - Filtros: busca
  - Badge contador: Warehouse (orange)

- **SIFs** (`/admin/sifs`)
  - Filtros: busca
  - Badge contador: FileBox (teal)

- **Etiquetas** (`/admin/etiquetas`)
  - Filtros: busca, status (pendente/completo/erro)
  - Mantidos: toggle grid/list, ordenação
  - Badge contador: Package (blue)

#### **🎨 Melhorias de Interface**
- ✅ Removidos headers grandes com título/descrição/estatísticas
- ✅ Interface minimalista - apenas botão Filtros alinhado à direita
- ✅ Contador de resultados com ícone colorido específico
- ✅ Badges de filtros ativos abaixo do contador
- ✅ Mensagens vazias dinâmicas baseadas em filtros ativos
- ✅ Cores específicas mantidas para cada módulo

### 🎯 Melhorias de UX

#### **Ficha Técnica**
- **Botão Voltar**: Adicionado na topbar da página de listagem `/ficha-tecnica`
  - Redireciona para `/operador`
  - Consistente com outras páginas do sistema

#### **Ícones do Menu Operações**
- **Entrada de Insumos**: Truck 🚚 (caminhão)
- **Produção**: UtensilsCrossed 🍴 (talheres cruzados)
- **Ficha Técnica**: ChefHat 👨‍🍳 (chapéu de chef)
- **Etiquetas**: Tag 🏷️ (etiqueta)
- **Admin**: Shield 🛡️ (escudo)
- Ícones sincronizados entre cards principais e menu lateral

### 🚀 Benefícios Técnicos
- Interface muito mais limpa e profissional
- UX consistente em todas as páginas administrativas
- Fácil adicionar novos filtros sem poluir a UI
- Sistema 100% reutilizável para futuras listagens
- Melhor experiência mobile com Sheet lateral fullscreen
- Componentes totalmente type-safe com TypeScript

---

## [0.3.5] - 2025-10-02

### 🎨 Redesign Completo das Páginas de Autenticação

#### **Interface Modernizada com Tema Azul**
- **🔐 Página de Login**: Redesenhada com layout moderno e limpo
  - Card centralizado com sombra e bordas arredondadas (rounded-2xl)
  - Logo com gradiente azul (from-blue-500 to-blue-600)
  - Título em gradiente "Minha Ficha" (from-blue-600 to-blue-700)
  - Background com gradiente sutil (from-blue-50 via-cyan-50 to-slate-50)
  - Removido header com versão, interface full-screen centrada
  - Dark mode completo em todos os elementos

#### **🔗 Autenticação Magic Link**
- **Novo Método de Login**: Botão "Receber link no email"
  - Implementado com `signInWithOtp()` do Supabase
  - Tela de confirmação após envio do email
  - Mensagens de sucesso/erro com toast notifications
  - Ícone de email (Mail) no botão
  - Estilo azul consistente com tema geral

#### **🔑 Sistema de Recuperação de Senha**
- **Página "Esqueci Minha Senha"**: Completamente refeita
  - Formulário com campo de email único
  - Usa `resetPasswordForEmail()` do Supabase (corrigido)
  - Ícone KeyRound em gradiente azul
  - Tela de confirmação após envio
  - Redirecionamento para `/auth/reset-password`

- **Nova Página "Redefinir Senha"**: Criada do zero
  - Campos de senha e confirmação de senha
  - Validação client-side para senhas correspondentes
  - Usa `updateUser()` para atualizar senha
  - Ícone Lock em gradiente azul
  - Tela de sucesso com redirecionamento automático para login
  - Mensagens de feedback claras

- **Nova Rota de Callback**: `/auth/callback`
  - Handler para processar magic links e reset de senha
  - Usa `exchangeCodeForSession()` para troca de código
  - Redirecionamento inteligente após autenticação
  - Tratamento de erros com mensagem na URL

#### **🏪 Página de Seleção de Loja Redesenhada**
- **Interface Modernizada**: Seguindo padrão das páginas de auth
  - Removido header com logo e versão
  - Layout centralizado com gradiente azul de background
  - Logo grande com gradiente azul no topo
  - Título "Minha Ficha" e subtítulo explicativo
  - Cards de loja com hover effects (scale-105, border-blue-500)
  - Avatares com ícone de Store em gradiente azul
  - Grid responsivo (1/2/3 colunas conforme breakpoint)
  - Sombras e bordas suaves (shadow-lg, rounded-2xl)

- **Organização de Arquivos**: Movido de `(app)` para raiz
  - De: `/app/(app)/store-picker/`
  - Para: `/app/store-picker/`
  - Criado `layout.tsx` próprio com gradiente azul
  - Atualizado imports em `user-menu.tsx` e `store-selector.tsx`

#### **🎨 Mudança de Paleta de Cores**
- **Tema Unificado Azul/Ciano**: Substituição completa
  - Background: `orange-50` → `blue-50`, `amber-50` → `cyan-50`
  - Gradientes de logo: `orange-500/amber-500` → `blue-500/blue-600`
  - Texto em gradiente: `orange-600/amber-600` → `blue-600/blue-700`
  - Hover states: `orange-700/amber-700` → `blue-700/blue-800`
  - Bordas e acentos em tonalidades de azul

#### **📱 Layout Responsivo Aprimorado**
- **FormBuilder Footer**: Mudança de layout
  - Botões agora em linhas separadas (flex-col)
  - "Esqueci minha senha" abaixo do botão principal
  - Melhor UX em mobile e desktop
  - Separação clara entre ação principal e secundária

### 🛠 Melhorias Técnicas
- **🗂️ Organização de Rotas**: Store picker fora do grupo `(app)` para evitar header
- **🎯 Componentes Simplificados**: Removido FormBuilder2 em favor de formulários manuais
- **⚡ Estado Local**: Uso de `useState` para controle de fluxo (magicLinkSent, emailSent, passwordReset)
- **🔄 Redirecionamentos**: Lógica de redirect após autenticação bem definida
- **📝 Validação**: Verificação client-side para senhas correspondentes

### 🐛 Correções
- **Zod Schema**: Removido `.required()` após `.refine()` (não suportado)
- **Imports**: Atualizados após mover store-picker (`@/app/store-picker/select-store`)
- **Fluxo de Recuperação**: Corrigido para usar `resetPasswordForEmail` ao invés de login action
- **Callback OAuth**: Implementado handler para processar códigos do Supabase

---

## [0.3.4] - 2025-10-02

### 🧑‍🍳 Melhorias no Sistema de Ficha Técnica

#### **Interface com Tabs**
- **📑 Sistema de Abas**: Implementadas 3 tabs na ficha técnica
  - **Ingredientes**: Gestão completa de ingredientes com busca e edição inline
  - **Preparo**: Editor de texto rico para modo de preparo + tempo estimado
  - **Fotos**: Upload e gerenciamento de fotos com capa
- **🎨 UI Mobile-First**: Interface redesenhada para mobile
  - Cards compactos e responsivos
  - Margens reduzidas
  - Texto adaptativo (desktop: "ingredientes", mobile: "ingred.")
  - Imagens otimizadas (thumbnails 32px em cards, 48px na listagem)

#### **Editor de Texto Rico**
- **✏️ Editor Quill**: Substituído Tiptap por react-quill-new
  - Compatível com React 18
  - Toolbar compacta em uma linha
  - Suporte a: Bold, Italic, Headers (H2/H3), Listas (ordenadas/marcadores), Alinhamento
  - Dark mode completo
  - Tooltips em português
  - Loading state durante carregamento

#### **Gerenciamento de Fotos**
- **📸 Upload de Fotos**: Sistema completo de fotos
  - Upload múltiplo (máx. 10 fotos por ficha)
  - Validação de tipo (JPG, PNG, WebP) e tamanho (5MB)
  - Definir foto de capa (badge dourada "Capa")
  - Visualização em tela cheia com dialog
  - Grid responsivo (3/4/5 colunas conforme breakpoint)
  - Thumbnails compactos (h-32)
  - Botões de ação no hover (Visualizar, Tornar Capa, Excluir)
- **🗄️ Storage Integration**: Supabase Storage
  - Bucket 'arquivos' com RLS policies
  - Organização por loja e ficha técnica
  - URLs públicas para acesso às imagens

#### **Busca e Filtros Avançados**
- **🔍 Sistema de Busca**: Painel lateral (Sheet) com filtros
  - Campo de busca por nome ou código
  - Filtro por Grupo (dropdown)
  - Filtro por Setor (dropdown)
  - Filtro por Status: Com/Sem ingredientes, Com/Sem foto
  - Indicador visual (bolinha laranja) quando há filtros ativos
  - Botão "Limpar Tudo"
  - Contador de resultados em tempo real
  - Filtros aplicados instantaneamente (client-side)

#### **Listagem de Fichas**
- **📋 Cards Compactos**: Interface redesenhada
  - Foto de capa exibida (quando disponível)
  - Badges de status (ingredientes, foto)
  - Layout responsivo (1/2/3 colunas)
  - Hover com escala sutil (1.02x)
  - Botão centralizado "Adicionar Item"
  - Botão "Filtros" à direita

#### **UX Melhorada**
- **⚠️ Confirmações**: Dialogs de confirmação
  - Exclusão de ingredientes (AlertDialog)
  - Exclusão de fotos (AlertDialog)
  - Mensagens claras e destrutivas
- **🏷️ Navegação**: Atualizado componente Logo
  - Rota "/ficha-tecnica" exibe "Fichas Técnicas"
  - Padrão consistente com outras telas

#### **Banco de Dados**
- **🗄️ Migração**: Novas tabelas e campos
  - `modo_preparo` (TEXT) em `fichas_tecnicas`
  - `tempo_preparo_minutos` (INTEGER) em `fichas_tecnicas`
  - Tabela `fichas_tecnicas_fotos` com campos:
    - `url`, `is_capa`, `ordem`
    - Índice único para garantir apenas 1 foto de capa
    - Trigger para atualizar capa automaticamente
- **🔐 Multi-tenancy**: Correção no proxy Supabase
  - Adicionada `fichas_tecnicas_fotos` à lista de exceção
  - Tabela não possui `loja_id` (herda via FK)

#### **Dependências**
- **➕ Adicionados**:
  - `react-quill-new@^3.6.0` (fork compatível com React 18)
  - `quill@^2.0.3`
- **➖ Removidos**:
  - `@tiptap/react`
  - `@tiptap/starter-kit`
  - `@tiptap/extension-placeholder`

---

## [0.3.3] - 2025-10-01

### 🧑‍🍳 Sistema de Ficha Técnica

#### **Nova Funcionalidade Completa**
- **📋 Gestão de Fichas Técnicas**: Sistema completo para gerenciar receitas e ingredientes de produtos de cardápio
  - Listagem de produtos marcados como "Item de Cardápio"
  - Interface para adicionar, editar e remover ingredientes
  - Contador dinâmico de ingredientes que atualiza em tempo real
  - Busca de produtos com autocomplete e debounce (300ms)
  - Cálculo automático de quantidades e unidades de medida

#### **Banco de Dados**
- **🗄️ Novas Tabelas**: Criadas tabelas `fichas_tecnicas` e `fichas_tecnicas_itens`
- **🔐 RLS Policies**: Implementadas políticas de segurança para multi-tenancy
- **🔗 Relacionamentos**: FKs entre fichas técnicas, produtos de cardápio e ingredientes
- **✅ Campo Novo**: Adicionado campo `item_de_cardapio` à tabela `produtos`

#### **Formulário de Produtos Aprimorado**
- **➕ Quick-Add Modals**: Botões de adicionar rápido para:
  - Grupos (sem abandonar o formulário)
  - Setores (com criação inline)
  - Locais de Armazenamento (cadastro rápido)
- **🔄 Estado Sincronizado**: Listas atualizadas dinamicamente sem reload
- **📝 Callbacks**: Sistema de callbacks para sincronizar estado entre componentes

#### **Navegação e Menus**
- **🧭 Rotas Criadas**:
  - `/ficha-tecnica` - Listagem de produtos de cardápio
  - `/ficha-tecnica/[id]` - Edição de ficha técnica específica
- **📱 Menu Principal**: Card "Ficha Técnica" vai direto para listagem
- **🍔 Burger Menu**: Item "Ficha Técnica" adicionado ao menu lateral
- **🎛️ Menu Admin**: Opção "Ficha Técnica" no painel administrativo
- **🔙 Botão Voltar**: Implementado no header das páginas de ficha técnica

#### **Componentes Criados**
- **`FichaTecnicaForm`**: Formulário principal de gestão de ingredientes
  - Adicionar ingredientes com busca e quantidade
  - Editar quantidades inline
  - Remover ingredientes com confirmação
  - Estado local otimista para UX fluida
- **`IngredienteSelector`**: Autocomplete para busca de produtos
  - Debounce de 300ms para performance
  - Listagem com código, nome, grupo e unidade
  - Input de quantidade antes de adicionar
- **`SelectWithAddGrupo`**: Modal para criar grupos sem sair do formulário
- **`SelectWithAddSetor`**: Modal para criar setores inline
- **`SelectWithAddArmazenamento`**: Modal para criar locais de armazenamento

#### **Server Actions**
- **`upsertFichaTecnica`**: Criar ou atualizar ficha técnica
- **`addIngrediente`**: Adicionar ingrediente à receita
- **`updateIngrediente`**: Atualizar quantidade de ingrediente
- **`removeIngrediente`**: Remover ingrediente da ficha
- **`searchProdutos`**: Buscar produtos para usar como ingredientes

#### **Melhorias Técnicas**
- **🚫 Removido revalidatePath**: Compatibilidade com Next.js 15
- **🎯 Estado Local**: Uso de `useState` para atualizações sem reload
- **🔧 Proxy Supabase**: Tabela `fichas_tecnicas_itens` adicionada à lista de exceções de `loja_id`
- **✨ Type Generation**: Types do Supabase atualizados com novas tabelas
- **🎨 Ícone ChefHat**: Adicionado ao CardButton e menus

### 🐛 Correções
- **Lint**: Escapamento de aspas em mensagens de erro
- **Cache**: Listas de grupos/armazenamentos não atualizavam após criação
- **Multi-tenancy**: Filtro `loja_id` aplicado incorretamente em tabela de relacionamento
- **onChange Error**: Acesso correto ao `formField.onChange` em custom components

## [0.3.3] - 2025-08-28

### 🎨 Modernização da Página de Produtos

#### **Interface Completamente Redesenhada**
- **📦 Header Moderno**: Layout com gradiente azul/índigo seguindo padrão estabelecido
  - Título "Gestão de Produtos" com ícone contextual
  - Descrição responsiva com truncamento inteligente no mobile
  - Estatísticas em cards: Total, Ativos, Principais, Insumos
  - Design responsivo com padding e ícones adaptativos

#### **Cards de Estatísticas Inteligentes**
- **📊 Métricas Organizadas**: 4 cards informativos com cores temáticas
  - **Total**: Contador geral de produtos (Database icon)
  - **Ativos**: Produtos ativos com cor verde (Package icon)
  - **Principais**: Produtos pai com cor azul (Layers icon) 
  - **Insumos**: Produtos filhos com cor roxa (ShoppingCart icon)
- **🔧 Layout Responsivo**: `grid-cols-2 lg:grid-cols-4` para otimização mobile/desktop

#### **Seção de Ações Modernizada**
- **⚡ Botões Organizados**: Card dedicado para ações de gerenciamento
  - Novo Produto (ButtonAdd)
  - Importar Excel (ImportProdutos)
  - Baixar Lista (ButtonExcel)
- **📱 Layout Adaptativo**: Empilhamento vertical no mobile, horizontal no desktop

#### **Correções e Melhorias Técnicas**
- **🐛 Erro de Hidratação**: Corrigido problema de `<div>` dentro de `<p>` no ProdutosView
  - Substituído `CardDescription` por `<div>` com classes apropriadas
- **🗂️ Container Adequado**: Removido `ContentGrid` inadequado que causava layout espremido
  - Implementado container responsivo normal com `container mx-auto px-4 py-6`
- **👁️ Visualização Padrão**: Alterado para modo "lista" ao invés de "cards"
  - Melhor experiência inicial para visualização de produtos

#### **Design System Consistente**
- **🎨 Tema Azul/Índigo**: Seguindo padrão estabelecido para seção de produtos
- **📏 Espaçamento Otimizado**: Reduzido para `space-y-4` para melhor aproveitamento
- **🔤 Tipografia Responsiva**: Tamanhos adaptativos (`text-xl sm:text-2xl`)
- **💫 Micro-interações**: Hover effects e transições suaves

## [0.3.2] - 2025-08-28

### 🎨 Modernização Completa da Interface Admin + Processos

#### **Modernização das Telas de Processo**
- **🚛 Entrada de Insumos**: Interface redesenhada com tema azul/sky
  - Cards organizados: Dados da Entrega + Rastreabilidade
  - Análise de conformidade com botões visuais lado a lado
  - Campo de observações reposicionado após conformidades
  - Validação condicional: observações obrigatórias para não conformidades
  - Layout responsivo otimizado para mobile

- **⚙️ Produção**: Interface moderna com tema verde/emerald  
  - Layout de insumos responsivo sem overflow no mobile
  - Métricas de produção com cards coloridos (fator correção, perda, insumos)
  - Cálculos automáticos de peso líquido e percentual de perda
  - Dialog de confirmação substituindo drawer antigo
  - Grid adaptativo: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

- **🏷️ Geração de Etiquetas**: Interface inteligente com tema azul/indigo
  - Auto-seleção de template/impressora quando há apenas 1 opção
  - Campo de validade bloqueado quando produto tem dias configurados
  - Preview de configuração antes da impressão  
  - Campos dinâmicos baseados no template selecionado
  - Feedback visual para seleções automáticas

#### **Funcionalidades Inteligentes**
- **🤖 Auto-seleção**: Templates e impressoras selecionados quando únicos
- **🔒 Campos Bloqueados**: Validade calculada automaticamente e protegida
- **📱 Mobile First**: Todos os layouts otimizados para dispositivos móveis
- **⚡ UX Contextual**: Placeholders e validações baseadas no estado do form

#### **Filtros de Data Aprimorados** 
- **Seleção Rápida de Períodos**: 6 botões pré-definidos para acesso imediato
  - Hoje (dia atual)
  - Esta Semana
  - Este Mês  
  - Últimos 7 dias
  - Últimos 30 dias
  - Mês Anterior
- **Botão Limpar**: Reset rápido do filtro de data
- **Interface Organizada**: Separação clara entre seleção rápida e calendário personalizado
- **Ícones Visuais**: Cada período com ícone representativo (CalendarDays, Zap)

#### **Relatórios Simplificados**
- **Foco em Relatórios Analíticos**: Interface limpa com apenas 3 relatórios essenciais
- **Filtros Inline**: Configuração direta na mesma tela, sem navegação adicional
- **Cards Coloridos**: Cada relatório com cor temática única (verde, roxo, azul)
- **Filtros Colapsáveis**: Economia de espaço com seções expansíveis

#### **Telas Admin Modernizadas**
Todas as telas seguem novo padrão visual consistente:
- **Grupos**: Tema roxo com preview de cores
- **Armazenamento**: Tema âmbar com indicador de temperatura
- **Fabricantes**: Tema esmeralda com contadores de produtos
- **Setor**: Tema azul com organização departamental
- **SIF**: Tema vermelho com status de ativação
- **Operadores**: Tema ciano com indicadores online/offline
- **Impressoras**: Tema violeta com status de rede
- **Templates**: Tema rosa com dimensões visuais
- **Configurações**: Tema âmbar com JSON avançado

### 🛠 Melhorias Técnicas
- **📖 Guia de Estilos**: DESIGN_PATTERNS.md criado para manter consistência
- **🎯 Componentes Reutilizáveis**: QuickReportCard com filtros integrados
- **📅 date-fns**: Manipulação precisa de datas com locale pt-BR
- **⚡ Estado Consistente**: useTransition para feedback de carregamento
- **🎨 Gradientes Modernos**: Visual atualizado com hover effects
- **📱 Grid Sistema**: Responsividade consistente em todas as telas

## [0.3.0] - 2025-08-27

### 🚀 **Importação de Produtos Revolucionária**

#### **Sistema de Importação Inteligente**
- **Códigos Inteligentes**: Geração automática de códigos mais legíveis no formato `25H27001` (Ano/Mês/Dia/Sequencial) em vez de timestamps longos
- **Sistema de Skip**: Checkboxes para permitir que usuários marquem linhas específicas para pular durante a importação
- **Preview Interativo**: Tabela de pré-visualização com edição inline e dropdowns para seleção de grupos, armazenamentos e produtos pai
- **Detecção de Conflitos**: Identificação automática de produtos duplicados, códigos conflitantes e dados inconsistentes
- **Criação Automática de Relacionamentos**: Criação automática de grupos, armazenamentos e produtos pai quando não existem

#### **Sistema de Histórico de Importações**
- **Armazenamento Completo**: Preservação de todos os arquivos Excel importados
- **Rastreabilidade Total**: Histórico detalhado linha por linha de cada importação
- **Interface Visual**: Modal integrado para visualização do histórico com estatísticas completas
- **Auditoria**: Dados originais preservados para compliance e troubleshooting

#### **Interface de 3 Etapas**
- **Etapa 1**: Upload com validação de formato e tamanho
- **Etapa 2**: Preview interativo com edição e resolução de conflitos
- **Etapa 3**: Resultado final com estatísticas detalhadas

### ✨ Features Adicionadas (Versões Anteriores)

#### 🏢 Sistema Master Dashboard
- **Novo dashboard master** para gerenciamento de lojas e usuários
- **Página de setup master** (`/setup-master`) para configuração inicial de permissões
- **Gerenciamento completo de usuários**: 
  - Listagem de todos os usuários do sistema
  - Visualização de associações entre usuários e lojas
  - Modal para adicionar usuários a lojas específicas
  - Funcionalidade para ativar/desativar usuários por loja
  - Funcionalidade para remover usuários de lojas
- **Botões de navegação "Voltar"** em todas as páginas master
- **Interface aprimorada** com badges mostrando número de usuários/lojas

#### 📊 Relatórios Analíticos
- **Nova seção "Analíticos"** no menu de relatórios
- **Relatório de Produção** (movido de "Producao versao 2"):
  - Filtro por período com calendário
  - Exportação Excel com formatação profissional
  - Agrupamento por produto pai e data
- **Relatório de Fator de Conversão**:
  - Cálculo automático FC = Peso Bruto ÷ Peso Líquido
  - Agrupamento de produtos pai por dia
  - Formatação específica (FC com 2 casas decimais)
- **Relatório de Entradas de Insumos**:
  - Todos os campos do formulário de entrada
  - Conformidades formatadas (Conforme/Não Conforme)
  - Dados completos: fornecedor, NF, SIF, temperatura, lote, etc.

#### 🏪 Seletor de Lojas
- **Store Selector** no header e sidebar
- **Indicação visual** da loja atual
- **Troca fácil** entre lojas com acesso

#### 🔐 Melhorias de Autenticação
- **Cliente admin** para áreas master (sem filtro de multi-tenancy)
- **Rotas públicas** para setup master
- **APIs dedicadas** para gerenciamento master

### 🐛 Correções
- **Filtros multi-tenancy** corrigidos no dashboard master
- **Relações Supabase** especificadas corretamente para entradas de insumos
- **Navegação consistente** com botões de voltar
- **Status de usuários** sincronizado corretamente

### 🛠 Melhorias Técnicas
- **APIs RESTful** para todas as operações master:
  - `/api/master/assign-user-to-store`
  - `/api/master/toggle-user-store-status` 
  - `/api/master/remove-user-from-store`
  - `/api/setup-master`
- **APIs de relatórios** reorganizadas em `/api/reports/analiticos/`
- **Componentes reutilizáveis** para gerenciamento de usuários
- **TypeScript interfaces** bem definidas
- **Validações** e tratamento de erros robusto

### 📁 Estrutura de Arquivos
```
src/app/
├── (master)/dashboard/          # Dashboard master
│   ├── usuarios/               # Gerenciamento de usuários
│   └── lojas/[id]/            # Detalhes da loja
├── (admin)/admin/reports/
│   └── analiticos/            # Relatórios analíticos
│       ├── producao/
│       ├── fator-conversao/
│       └── entradas-insumos/
├── api/
│   ├── master/                # APIs de gerenciamento master
│   └── reports/analiticos/    # APIs de relatórios
└── setup-master/              # Configuração inicial
```

### 📱 Interface
- **Layout responsivo** em todas as novas páginas
- **Componentes consistentes** com o design system
- **Feedback visual** com toasts para todas as operações
- **Loading states** em operações assíncronas
- **Cards organizados** para melhor UX