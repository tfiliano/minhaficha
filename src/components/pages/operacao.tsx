import { AnimationTransitionPage } from "../animation";
import { CardButton, ContentGrid, Title } from "../layout";

export function Operacao({ tipoUsuario }: any) {
  const operacaos = [
    //     1 entra insumos
    // 2 produção
    // 3 ficha técnica
    // 4 etiqueta

    {
      title: "Entrada de Insumos",
      url: null,
      icon: "Truck",
    },
    {
      title: "Produção",
      url: null,
      icon: "UtensilsCrossed",
    },
    {
      title: "Ficha Técnica",
      url: "/ficha-tecnica",
      icon: "ChefHat",
    },
    {
      title: "Etiquetas",
      url: null,
      icon: "Tag",
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
            icon={operacao.icon as any}
            url={
              operacao.url
                ? operacao.url
                : {
                    pathname: "/operador",
                    query: { operacao: operacao.title },
                  }
            }
          />
        ))}
        {["admin", "master"].includes(tipoUsuario) && (
          <CardButton title="Admin" url="admin" icon="Shield" />
        )}
      </ContentGrid>
    </AnimationTransitionPage>
  );
}
