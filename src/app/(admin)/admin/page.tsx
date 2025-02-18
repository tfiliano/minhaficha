import { AnimationTransitionPage } from "@/components/animation";
import { CardButton, ContentGrid } from "@/components/layout";
import { adminMenuOptions } from "@/config/menu-options";

export default function Admin() {
  
  return (
    <AnimationTransitionPage>
      <ContentGrid>
        {adminMenuOptions.map((item) => (
          <CardButton
            key={item.label}
            title={item.label}
            url={{
              pathname: `admin/${item.href}`,
            }}
          />
        ))}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
