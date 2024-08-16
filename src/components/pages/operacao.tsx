import { AnimationTransitionPage } from "../animation";
import { CardButton, ContentGrid, Title } from "../layout";

export function Operacao() {
  const operacaos = [
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
        {operacaos.map((operacao) => (
          <CardButton
            key={operacao.title}
            title={operacao.title}
            url={{
              pathname: "/operador",
              query: { operacao: operacao.title },
            }}
          />
        ))}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
