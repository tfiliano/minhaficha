"use client";

import { Forms } from "@/components/forms";
import { ImpressoraProps } from "@/components/forms/Impressoras";

export function ImpressoraUpdateClient({ ...props }: ImpressoraProps) {
  return <Forms.Impressora.Update {...props} />;
}
