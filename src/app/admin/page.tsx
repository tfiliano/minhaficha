import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid } from "@/components/layout";

export default function Admin() {
  const menu = [
    {
      title: "Produtos",
      route: "produtos",
    },
    {
      title: "Etiquetas",
      route: "/adm-etiquetas",
    },
    {
      title: "Grupos",
      route: "/adm-grupos",
    },
    {
      title: "Armazenamento",
      route: "/adm-armazenamento",
    },
    {
      title: "Operadores",
      route: "/adm-operadores",
    },
    {
      title: "Fabricantes",
      route: "/adm-fabricantes",
    },
    {
      title: "Impressoras",
      route: "/adm-impressoras",
    },
    {
      title: "Configuraçõe da Loja",
      route: "/adm-configuracoes",
    },
  ];

  return (
    <AnimationTransitionPage>
      <ContentGrid>
        {menu.map((item) => (
          <CardButton
            key={item.title}
            title={item.title}
            url={{
              pathname: `admin/${item.route}`,
            }}
          />
        ))}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
