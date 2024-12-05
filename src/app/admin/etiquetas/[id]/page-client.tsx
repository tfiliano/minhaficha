"use client";

import { Forms } from "@/components/forms";
import { EtiquetaProps } from "@/components/forms/Etiquetas";

export function EtiquetasUpdateClient({ ...props }: EtiquetaProps) {
  return <Forms.Etiquetas.Update {...props} />;
}
