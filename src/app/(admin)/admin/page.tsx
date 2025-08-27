import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid } from "@/components/layout";
import { adminMenuOptions, type MenuCategory } from "@/config/menu-options";

// Agrupamento por categorias para melhor organização visual
const categoryOrder: MenuCategory[] = ['primary', 'config', 'system', 'analytics'];

const categoryTitles = {
  primary: "Principais",
  config: "Configurações", 
  system: "Sistema",
  analytics: "Relatórios"
} as const;

export default function Admin() {
  const groupedOptions = categoryOrder.reduce((acc, category) => {
    acc[category] = adminMenuOptions.filter(item => item.category === category);
    return acc;
  }, {} as Record<MenuCategory, typeof adminMenuOptions>);
  
  return (
    <AnimationTransitionPage>
      <div className="space-y-8">
        {categoryOrder.map((category) => {
          const items = groupedOptions[category];
          if (!items.length) return null;
          
          return (
            <section key={category}>
              <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-4">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {categoryTitles[category]}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {category === 'primary' && "Funcionalidades essenciais do sistema"}
                  {category === 'config' && "Configure e organize seus dados"}
                  {category === 'system' && "Administração e configurações avançadas"}
                  {category === 'analytics' && "Análise de dados e relatórios"}
                </p>
              </div>
              <ContentGrid>
                {items.map((item) => (
                  <CardButton
                    key={item.label}
                    title={item.label}
                    icon={item.icon as any}
                    description={item.description}
                    category={item.category as MenuCategory}
                    url={{
                      pathname: `admin/${item.href}`,
                    }}
                  />
                ))}
              </ContentGrid>
            </section>
          );
        })}
      </div>
    </AnimationTransitionPage>
  );
}
