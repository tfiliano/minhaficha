"use client";

import { Forms } from "@/components/forms";
import { LojaProps } from "@/components/forms/Loja";

export function CodigosAddClient({ ...props }: LojaProps) {
  return <Forms.Loja.Create {...props} />;
}
