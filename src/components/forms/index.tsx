import { PropsWithChildren } from "react";
import { Fabricantes } from "./Fabricantes";
import { Grupos } from "./Grupos";
import { LocalArmazenamento } from "./LocalArmazenamento";
import { Operadores } from "./Operadores";
import { Produto } from "./produtos";

export const Forms = {
  Produto,
  LocalArmazenamento,
  Grupos,
  Operadores,
  Fabricantes,
};

export function FormContent({ children }: PropsWithChildren) {
  return <div className="max-w-lg w-full mx-auto px-4">{children}</div>;
}
