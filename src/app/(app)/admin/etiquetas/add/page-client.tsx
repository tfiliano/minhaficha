"use client";

import { Forms } from "@/components/forms";
import { EtiquetaProps } from "@/components/forms/Etiquetas";

export function EtiquetasAddClient({ fabricantes }: EtiquetaProps) {
  return <Forms.Etiquetas.Create fabricantes={fabricantes} />;
}
