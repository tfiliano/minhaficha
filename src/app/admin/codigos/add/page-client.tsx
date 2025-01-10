"use client";

import { Forms } from "@/components/forms";
import { CodigosProps } from "@/components/forms/Codigos";

export function CodigosAddClient({ ...props }: CodigosProps) {
  return <Forms.Codigo.Create {...props} />;
}
