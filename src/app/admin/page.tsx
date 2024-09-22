import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";

export default function Admin() {
  const menu = [
    {
      title: "Produtos",
      route: "/admin/produtos",
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
      {/* <Title>SELECIONE UMA OPERAÇÃO</Title> */}
      <ContentGrid>
        {menu.map((item) => (
          <CardButton
            key={item.title}
            title={item.title}
            url={{
            pathname: `/admin/${item.route}` ,
              query: { item: item.title },
            }}
          />
        ))}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
