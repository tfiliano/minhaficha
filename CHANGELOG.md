# Changelog

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