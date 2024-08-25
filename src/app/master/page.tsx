import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid, Title } from "@/components/layout";

export default function Admin() {
  const menu = [
    {
      title: "Lojas",
      route: "/mst-lojas",
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
            pathname: item.route ,
              query: { item: item.title },
            }}
          />
        ))}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
