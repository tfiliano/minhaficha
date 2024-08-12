import React, { createContext, useContext, useState } from "react";

// Definindo a interface para o contexto
type DescomplicaContextData = {
  state: any;
  setState: React.Dispatch<any>;
  produtos: any[];
  setProdutos:  React.Dispatch<React.SetStateAction<any[]>>;
};

// Criando o contexto
const DescomplicaContext = createContext<DescomplicaContextData>(
  {} as DescomplicaContextData
);

// Criando o provider
export function DescomplicaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<any | null>(null);
  const [produtos,setProdutos] = useState<any[]>([])

  return (
    <DescomplicaContext.Provider value={{ state, setState,produtos,setProdutos }}>
      {children}
    </DescomplicaContext.Provider>
  );
}

// Hook para usar o contexto
export const useDescomplica = (): DescomplicaContextData => {
  const context = useContext(DescomplicaContext);
  if (!context) {
    throw new Error(
      "useDescomplica deve ser usado dentro de um DescomplicaProvider"
    );
  }
  return context;
};
