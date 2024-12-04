import { AnimationTransitionPage } from "../animation";
import { CardButton, ContentGrid, Title } from "../layout";

export function Operacao() {
  const operacaos = [
    //     1 entra insumos
    // 2 produção
    // 3 ficha técnica
    // 4 etiqueta

    {
      title: "Entrada de Insumos",
    },
    {
      title: "Produção",
    },
    {
      title: "Ficha Técnica",
    },
    {
      title: "Etiquetas",
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
        <CardButton title="Admin" url="admin" />
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
