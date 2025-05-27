"use client";

import { Forms } from "@/components/forms";
import { OperadorProps } from "@/components/forms/Operadores";

export function OperadoresUpdateClient({ ...props }: OperadorProps) {
  return <Forms.Operadores.Update {...props} />;
}
