import { AnimationTransitionPage } from "../animation";
import { CardButton, ContentGrid, Title } from "../layout";

export function Operation() {
  const operations = [
    {
      title: "Ficha Técnica",
    },
    {
      title: "Etiquetas",
    },
    {
      title: "Produção",
    },
    {
      title: "Validades",
    },
  ];

  return (
    <AnimationTransitionPage>
      <Title>SELECIONE UMA OPERAÇÃO</Title>
      <ContentGrid>
        {operations.map((operation) => (
          <CardButton
            key={operation.title}
            title={operation.title}
            url={{
              pathname: "/operators",
              query: { operation: operation.title },
            }}
          />
        ))}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
