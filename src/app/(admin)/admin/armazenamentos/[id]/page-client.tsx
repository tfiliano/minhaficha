"use client";

import { Forms } from "@/components/forms";
import { LocalArmazenamentoProps } from "@/components/forms/LocalArmazenamento";

export function LocalArmazenamentoUpdateClient({
  ...props
}: LocalArmazenamentoProps) {
  return <Forms.LocalArmazenamento.Update {...props} />;
}
