"use client";

import { Forms } from "@/components/forms";
import { CodigosProps } from "@/components/forms/Codigos";

export function CodigosUpdateClient({ ...props }: CodigosProps) {
  return <Forms.Codigo.Update {...props} />;
}
