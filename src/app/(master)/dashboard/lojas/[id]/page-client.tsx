"use client";

import { Forms } from "@/components/forms";
import { LojaProps } from "@/components/forms/Loja";

export function LojaUpdateClient({ ...props }: LojaProps) {
  return <Forms.Loja.Update {...props} />;
}
