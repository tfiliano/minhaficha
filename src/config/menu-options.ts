export const adminMenuOptions = [
  // Principais - Funcionalidades core do sistema
  {
    label: "Produtos",
    href: "produtos",
    icon: "Package",
    category: "primary",
    description: "Gerencie produtos e inventário"
  },
  {
    label: "Etiquetas",
    href: "etiquetas",
    icon: "QrCode",
    category: "primary",
    description: "Configure tipos de etiquetas"
  },
  {
    label: "Fila de Impressão",
    href: "impressao",
    icon: "PrinterIcon",
    category: "primary",
    description: "Monitore impressões ativas"
  },
  {
    label: "Ficha Técnica",
    href: "../ficha-tecnica",
    icon: "ChefHat",
    category: "primary",
    description: "Receitas e ingredientes"
  },

  // Configurações - Setup do sistema
  {
    label: "Grupos",
    href: "grupos",
    icon: "FolderTree",
    category: "config",
    description: "Organize por categorias"
  },
  {
    label: "Armazenamento",
    href: "armazenamentos",
    icon: "Archive",
    category: "config",
    description: "Locais de estoque"
  },
  {
    label: "Fabricantes",
    href: "fabricantes",
    icon: "Building2",
    category: "config",
    description: "Fornecedores e marcas"
  },
  {
    label: "Setor",
    href: "setores",
    icon: "MapPin",
    category: "config",
    description: "Áreas de trabalho"
  },
  {
    label: "SIF",
    href: "sifs",
    icon: "Shield",
    category: "config",
    description: "Códigos de inspeção"
  },
  
  // Sistema - Administração
  {
    label: "Operadores",
    href: "operadores",
    icon: "Users",
    category: "system",
    description: "Usuários e permissões"
  },
  {
    label: "Impressoras",
    href: "impressoras",
    icon: "Printer",
    category: "system",
    description: "Hardware de impressão"
  },
  {
    label: "Templates de Etiquetas",
    href: "templates/etiquetas",
    icon: "Layout",
    category: "system",
    description: "Designer de layouts"
  },
  {
    label: "Config. da Loja",
    href: "configuracoes",
    icon: "Settings",
    category: "system",
    description: "Configurações gerais"
  },
  
  // Analytics
  {
    label: "Relatórios",
    href: "reports",
    icon: "BarChart3",
    category: "analytics",
    description: "Dados e estatísticas"
  },
] as const;

export type MenuCategory = 'primary' | 'config' | 'system' | 'analytics';
