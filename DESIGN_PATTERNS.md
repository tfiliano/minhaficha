# Guia de Estilos e Padrões de Layout - MinhaFicha

Este documento define os padrões visuais e de código estabelecidos para manter consistência em todas as telas do sistema.

## 🎨 Padrões Visuais Gerais

### Tema de Cores por Seção
Cada seção administrativa tem uma cor temática própria:
- **Grupos**: Roxo (`purple-600`, `violet-600`)
- **Armazenamento**: Âmbar (`amber-600`)  
- **Fabricantes**: Esmeralda (`emerald-600`)
- **Setor**: Azul (`blue-600`)
- **SIF**: Vermelho (`red-600`)
- **Operadores**: Ciano (`cyan-600`)
- **Impressoras**: Violeta (`violet-600`)
- **Templates**: Rosa (`pink-600`)
- **Configurações**: Âmbar (`amber-600`)
- **Relatórios**: Azul (`blue-600`)

### Processos Operacionais
- **Entrada de Insumos**: Azul/Sky (`blue-600`, `sky-600`)
- **Produção**: Verde/Emerald (`emerald-600`, `green-600`)
- **Geração de Etiquetas**: Azul/Indigo (`blue-600`, `indigo-600`)

## 🏗️ Estrutura de Layout

### 1. Headers Modernos
```tsx
<div className="bg-gradient-to-r from-[color]-600 to-[color2]-600 rounded-xl p-6 text-white shadow-lg">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <Icon className="h-8 w-8" />
        Título da Página
      </h1>
      <p className="text-[color]-100">
        Descrição da funcionalidade
      </p>
    </div>
    <div className="hidden md:flex flex-col items-center gap-2">
      <Icon className="h-12 w-12 text-[color]-200" />
      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
        Sistema de [Nome]
      </Badge>
    </div>
  </div>
</div>
```

### 2. Cards de Conteúdo
```tsx
<Card className="border-2 border-[color]-200 dark:border-[color]-800 bg-gradient-to-r from-[color]-50 to-[color2]-50 dark:from-[color]-950 dark:to-[color2]-950">
  <CardHeader>
    <CardTitle className="text-2xl flex items-center gap-3">
      <Icon className="h-6 w-6 text-[color]-600 dark:text-[color]-400" />
      Título do Card
    </CardTitle>
    <CardDescription className="flex items-center gap-4">
      <Badge variant="secondary" className="font-mono">
        CÓDIGO
      </Badge>
      <span>Informação adicional</span>
    </CardDescription>
  </CardHeader>
</Card>
```

### 3. Grids Responsivos
```tsx
{/* Admin Lists */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

{/* Form Fields */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

{/* Metrics */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
```

## 📱 Responsividade Mobile

### Breakpoints Padrão
- **Mobile**: `grid-cols-1`
- **Tablet**: `sm:grid-cols-2` 
- **Desktop**: `lg:grid-cols-3`

### Headers Responsivos
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <CardTitle>Título</CardTitle>
  <div className="flex gap-2 flex-wrap">
    <Badge className="text-xs">Badge</Badge>
  </div>
</div>
```

### Conformidades/Seleções
```tsx
{/* Mobile: botões empilhados verticalmente */}
<div className="flex gap-2">
  <Button className="flex-1 h-10">Opção 1</Button>
  <Button className="flex-1 h-10">Opção 2</Button>
</div>
```

## 🎯 Componentes Específicos

### Loading Overlay Padrão
```tsx
<div className={cn(
  "fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-300",
  loading ? "opacity-100" : "opacity-0 pointer-events-none"
)}>
  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
    <LoaderCircle className="h-8 w-8 animate-spin text-[color]-500" />
    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {loadingText || "Processando..."}
    </p>
  </div>
</div>
```

### Botões de Ação
```tsx
<div className="flex justify-end gap-3">
  <Button type="button" variant="outline" onClick={() => router.back()}>
    Cancelar
  </Button>
  <Button 
    type="submit" 
    disabled={loading}
    className="min-w-[150px] bg-gradient-to-r from-[color]-500 to-[color]-600 hover:from-[color]-600 hover:to-[color]-700"
  >
    {loading ? (
      <>
        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
        Processando...
      </>
    ) : (
      <>
        <Icon className="h-4 w-4 mr-2" />
        Texto do Botão
      </>
    )}
  </Button>
</div>
```

### Estados Vazios
```tsx
<div className="text-center py-8 text-slate-500 dark:text-slate-400">
  <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
  <h3 className="font-semibold mb-2">Nenhum item encontrado</h3>
  <p className="text-sm">Descrição do estado vazio</p>
</div>
```

### Cards de Métricas
```tsx
<div className="p-3 bg-[color]-50 dark:bg-[color]-900/20 rounded-lg border border-[color]-200 dark:border-[color]-800">
  <div className="flex items-center justify-between">
    <div className="flex-1 min-w-0">
      <p className="text-xs text-[color]-600 dark:text-[color]-400 truncate">Título</p>
      <p className="text-lg font-bold text-[color]-700 dark:text-[color]-300 truncate">
        Valor
      </p>
    </div>
    <Icon className="h-6 w-6 text-[color]-500 opacity-50 flex-shrink-0 ml-2" />
  </div>
</div>
```

## 🔧 Funcionalidades Inteligentes

### Auto-seleção de Campos
```tsx
// Quando há apenas uma opção disponível
if (options.length === 1) {
  setValue("field", options[0].id);
}

// Feedback visual
{options.length === 1 && (
  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
    <CheckCircle2 className="h-3 w-3" />
    Selecionado automaticamente
  </p>
)}
```

### Campos Condicionais
```tsx
// Campo bloqueado quando calculado automaticamente
<Input
  disabled={isAutoCalculated}
  className={cn(
    isAutoCalculated && "bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
  )}
  {...register("field")}
/>

{isAutoCalculated && (
  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
    <Info className="h-3 w-3" />
    Calculado automaticamente: {calculatedValue}
  </p>
)}
```

### Validação Condicional
```tsx
// Campos obrigatórios baseados em contexto
{...register("observacoes", {
  ...(hasNonCompliance && {
    required: "Observações são obrigatórias quando há não conformidades"
  })
})}

// Placeholder dinâmico
placeholder={
  hasNonCompliance 
    ? "Descreva detalhadamente os problemas encontrados..."
    : "Observações adicionais..."
}
```

## 🎨 Alertas e Feedback

### Alertas de Estado
```tsx
{/* Sucesso */}
<div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
  <div className="flex items-center gap-3">
    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
    <div>
      <p className="font-medium text-emerald-700 dark:text-emerald-300">Título</p>
      <p className="text-sm text-emerald-600 dark:text-emerald-400">Descrição</p>
    </div>
  </div>
</div>

{/* Atenção */}
<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
    <div>
      <p className="font-medium text-amber-700 dark:text-amber-300">Título</p>
      <p className="text-sm text-amber-600 dark:text-amber-400">Descrição</p>
    </div>
  </div>
</div>
```

### Badges de Status
```tsx
{/* Contador positivo */}
<Badge variant="outline" className="text-emerald-600 border-emerald-600 text-xs">
  <CheckCircle2 className="h-3 w-3 mr-1" />
  {count} Conforme{count > 1 ? 's' : ''}
</Badge>

{/* Contador negativo */}
<Badge variant="outline" className="text-red-600 border-red-600 text-xs">
  <XCircle className="h-3 w-3 mr-1" />
  {count} Não Conforme{count > 1 ? 's' : ''}
</Badge>
```

## 📋 Checklist de Nova Tela

Ao criar uma nova tela, verificar:

- [ ] **Cor temática** definida e consistente
- [ ] **Header com gradiente** e informações contextuais
- [ ] **Grid responsivo** (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- [ ] **Cards com bordas coloridas** usando a cor do tema
- [ ] **Loading state** com overlay e backdrop blur
- [ ] **Estados vazios** tratados com ícones e mensagens
- [ ] **Botões de ação** no canto inferior direito
- [ ] **Validação** com feedback visual apropriado
- [ ] **Responsividade** testada em mobile
- [ ] **Dark mode** suportado em todas as cores
- [ ] **Acessibilidade** com labels e aria-labels apropriados
- [ ] **Ícones consistentes** da biblioteca Lucide React

## 🔄 Padrão de Fluxo de Dados

### Server Components (page.tsx)
```tsx
export default async function PageName(props: Props) {
  const supabase = await createClient();
  const { data: items } = await supabase.from("table").select();
  
  return (
    <AnimationTransitionPage>
      <div className="min-h-screen bg-gradient-to-br from-[color]-50 via-[color2]-50 to-[color3]-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          {/* Content */}
          <PageClient items={items} />
        </div>
      </div>
    </AnimationTransitionPage>
  );
}
```

### Client Components (page-client.tsx)
```tsx
export function PageClient({ items }: Props) {
  const [loading, setLoading] = useState(false);
  
  return (
    <>
      {/* Loading Overlay */}
      {/* Form/Content */}
      {/* Action Buttons */}
    </>
  );
}
```

## 🎭 Ícones Padrão por Contexto

### Operações
- **Entrada**: `Truck`, `Package`
- **Produção**: `Factory`, `Scale`  
- **Etiquetas**: `Tag`, `Printer`
- **Configuração**: `Settings`, `Palette`

### Status/Estados
- **Sucesso**: `CheckCircle2`
- **Erro**: `XCircle`
- **Atenção**: `AlertTriangle`
- **Info**: `Info`
- **Loading**: `LoaderCircle`

### Dados
- **Número**: `Hash`
- **Data**: `Calendar`
- **Texto**: `FileText`
- **Empresa**: `Building`
- **Temperatura**: `Thermometer`

Este guia garante **consistência visual** e **manutenibilidade** do código em futuras implementações!