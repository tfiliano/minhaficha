"use client";

import { Forms } from "@/components/forms";
import { ImpressoraProps } from "@/components/forms/Impressoras";

export function ImpressoraAddClient({ ...props }: ImpressoraProps) {
  return <Forms.Impressora.Create {...props} />;
}
