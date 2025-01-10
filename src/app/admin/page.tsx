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
      route: "etiquetas",
    },
    {
      title: "Grupos",
      route: "grupos",
    },
    {
      title: "Armazenamento",
      route: "armazenamentos",
    },
    {
      title: "Operadores",
      route: "operadores",
    },
    {
      title: "Fabricantes",
      route: "fabricantes",
    },
    {
      title: "Impressoras",
      route: "impressoras",
    },
    {
      title: "Códigos",
      route: "codigos",
    },
    {
      title: "SIF",
      route: "sifs",
    },
    {
      title: "Config. da Loja",
      route: "configuracoes",
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
