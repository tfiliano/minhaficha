# Changelog

## [0.3.4] - 2025-10-02

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