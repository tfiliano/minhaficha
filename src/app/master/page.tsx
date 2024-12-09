import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid } from "@/components/layout";

export default function Admin() {
  const menu = [
    {
      title: "Lojas",
      route: "/master/lojas",
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
              pathname: item.route,
            }}
          />
        ))}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
